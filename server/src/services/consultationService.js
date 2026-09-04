import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { query } from '../db/connection.js'
import { getBookingRawById } from './bookingService.js'
import { getProfile } from './profileService.js'

const UPLOAD_DIR = path.resolve('uploads/consultation_images')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

function toMessageShape(row) {
  return {
    id: row.id,
    senderType: row.sender_type,
    text: row.text,
    hasImage: Boolean(row.image_path),
    imageUrl: row.image_path ? `/experts/consultations/messages/${row.id}/image` : null,
    recommendedProductId: row.recommended_product_id,
    createdAt: row.created_at,
  }
}

// Gọi khi người dùng xác nhận đặt lịch VÀ đồng ý gửi hồ sơ cá nhân cho chuyên gia xem trước.
// profile_snapshot chụp lại đúng thời điểm đồng ý, không tự đồng bộ theo hồ sơ mới hơn về sau.
// Route gọi hàm này chỉ sau khi đã kiểm tra `consent === true` trong body — ghi lại thành 1 sự kiện
// có dấu thời gian trong consent_events, thay vì chỉ ngầm hiểu qua việc thread tồn tại.
export async function createThreadForBooking(bookingId, userId) {
  const profile = await getProfile(userId)
  const { rows } = await query(
    `INSERT INTO consultation_threads (booking_id, profile_snapshot)
     VALUES ($1, $2) RETURNING *`,
    [bookingId, JSON.stringify(profile)],
  )
  await query(
    `INSERT INTO consent_events (user_id, consent_type, booking_id, granted)
     VALUES ($1,'profile_share_with_expert',$2,true)`,
    [userId, bookingId],
  )
  return rows[0]
}

export async function getThreadByBookingId(bookingId) {
  const { rows } = await query('SELECT * FROM consultation_threads WHERE booking_id = $1', [bookingId])
  return rows[0] || null
}

export async function getThreadForUser(userId, bookingId) {
  const booking = await getBookingRawById(bookingId)
  if (!booking || Number(booking.user_id) !== Number(userId)) return null
  const thread = await getThreadByBookingId(bookingId)
  if (!thread) return null
  return { thread, booking }
}

export async function getThreadForExpert(expertId, bookingId) {
  const booking = await getBookingRawById(bookingId)
  if (!booking || booking.expert_id !== expertId) return null
  const thread = await getThreadByBookingId(bookingId)
  if (!thread) return null
  return { thread, booking }
}

export async function listThreadsForExpert(expertId) {
  const { rows } = await query(
    `SELECT t.*, b.user_id, b.slot, b.status AS booking_status
     FROM consultation_threads t
     JOIN expert_bookings b ON b.id = t.booking_id
     WHERE b.expert_id = $1
     ORDER BY t.created_at DESC`,
    [expertId],
  )
  return rows.map((row) => ({
    bookingId: row.booking_id,
    threadId: row.id,
    status: row.status,
    slot: row.slot,
    bookingStatus: row.booking_status,
    profileSnapshot: JSON.parse(row.profile_snapshot),
    createdAt: row.created_at,
  }))
}

export async function listMessages(threadId) {
  const { rows } = await query(
    'SELECT * FROM consultation_messages WHERE thread_id = $1 ORDER BY created_at ASC',
    [threadId],
  )
  return rows.map(toMessageShape)
}

export async function postUserMessage(threadId, text) {
  await query(`UPDATE consultation_threads SET status = 'active' WHERE id = $1`, [threadId])
  const { rows } = await query(
    `INSERT INTO consultation_messages (thread_id, sender_type, text) VALUES ($1,'user',$2) RETURNING *`,
    [threadId, text],
  )
  return toMessageShape(rows[0])
}

export async function postExpertMessage(threadId, { text, file, recommendedProductId }) {
  let imagePath = null
  let imageMime = null
  if (file) {
    const ext = EXT_BY_MIME[file.mimetype] || ''
    const filename = `${crypto.randomUUID()}${ext}`
    imagePath = path.join(UPLOAD_DIR, filename)
    fs.writeFileSync(imagePath, file.buffer)
    imageMime = file.mimetype
  }

  await query(`UPDATE consultation_threads SET status = 'active' WHERE id = $1`, [threadId])
  const { rows } = await query(
    `INSERT INTO consultation_messages (thread_id, sender_type, text, image_path, image_mime, recommended_product_id)
     VALUES ($1,'expert',$2,$3,$4,$5) RETURNING *`,
    [threadId, text || null, imagePath, imageMime, recommendedProductId || null],
  )
  return toMessageShape(rows[0])
}

export async function getMessageRawById(id) {
  const { rows } = await query('SELECT * FROM consultation_messages WHERE id = $1', [id])
  return rows[0]
}

// Trả về user_id của booking sở hữu thread chứa message này — dùng để kiểm tra quyền xem ảnh.
export async function getThreadOwnerUserId(threadId) {
  const { rows } = await query(
    `SELECT b.user_id FROM consultation_threads t
     JOIN expert_bookings b ON b.id = t.booking_id WHERE t.id = $1`,
    [threadId],
  )
  return rows[0]?.user_id ?? null
}
