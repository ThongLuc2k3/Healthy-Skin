import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { query } from '../db/connection.js'

const FACE_PHOTO_DIR = path.resolve('uploads/face_photos')
fs.mkdirSync(FACE_PHOTO_DIR, { recursive: true })

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

function toProfileShape(row) {
  if (!row) {
    return {
      skinType: '',
      allergies: [],
      conditions: [],
      goals: [],
      skinTypeNote: '',
      allergiesNote: '',
      conditionsNote: '',
      goalsNote: '',
      consentGivenAt: null,
      facePhotoUrl: null,
      diagnosedConditions: [],
    }
  }
  return {
    skinType: row.skin_type,
    allergies: JSON.parse(row.allergies),
    conditions: JSON.parse(row.conditions),
    goals: JSON.parse(row.goals),
    skinTypeNote: row.skin_type_note ?? '',
    allergiesNote: row.allergies_note ?? '',
    conditionsNote: row.conditions_note ?? '',
    goalsNote: row.goals_note ?? '',
    consentGivenAt: row.consent_given_at ?? null,
    // Đường dẫn tương đối theo quy ước apiClient (không có tiền tố /api)
    facePhotoUrl: row.face_photo_path ? '/profile/face-photo' : null,
    diagnosedConditions: JSON.parse(row.diagnosed_conditions || '[]'),
  }
}

export async function getProfile(userId) {
  const { rows } = await query('SELECT * FROM profiles WHERE user_id = $1', [userId])
  return toProfileShape(rows[0])
}

export async function saveProfile(userId, profile) {
  await query(
    `INSERT INTO profiles
      (user_id, skin_type, allergies, conditions, goals, skin_type_note,
       allergies_note, conditions_note, goals_note, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
     ON CONFLICT(user_id) DO UPDATE SET
       skin_type=EXCLUDED.skin_type, allergies=EXCLUDED.allergies,
       conditions=EXCLUDED.conditions, goals=EXCLUDED.goals,
       skin_type_note=EXCLUDED.skin_type_note, allergies_note=EXCLUDED.allergies_note,
       conditions_note=EXCLUDED.conditions_note, goals_note=EXCLUDED.goals_note,
       updated_at=NOW()`,
    [userId, profile.skinType ?? '', JSON.stringify(profile.allergies ?? []),
      JSON.stringify(profile.conditions ?? []), JSON.stringify(profile.goals ?? []),
      profile.skinTypeNote ?? '', profile.allergiesNote ?? '', profile.conditionsNote ?? '',
      profile.goalsNote ?? ''],
  )
  return getProfile(userId)
}

export async function hasGivenConsent(userId) {
  const { rows } = await query('SELECT consent_given_at FROM profiles WHERE user_id = $1', [userId])
  return Boolean(rows[0]?.consent_given_at)
}

async function logConsentEvent(userId, consentType, granted, bookingId = null) {
  await query(
    `INSERT INTO consent_events (user_id, consent_type, booking_id, granted) VALUES ($1,$2,$3,$4)`,
    [userId, consentType, bookingId, granted],
  )
}

export async function giveConsent(userId) {
  await query(
    `INSERT INTO profiles (user_id, consent_given_at) VALUES ($1, NOW())
     ON CONFLICT(user_id) DO UPDATE SET consent_given_at=NOW()`,
    [userId],
  )
  await logConsentEvent(userId, 'sensitive_data_usage', true)
  return getProfile(userId)
}

// Thu hồi đồng ý dùng dữ liệu nhạy cảm — CHỈ tắt cờ consent (chặn upload ảnh/bệnh lý mới), KHÔNG tự
// xoá dữ liệu đã có. Xoá hẳn dữ liệu là hành động riêng, xem deleteSensitiveData().
export async function revokeConsent(userId) {
  await query('UPDATE profiles SET consent_given_at = NULL WHERE user_id = $1', [userId])
  await logConsentEvent(userId, 'sensitive_data_usage', false)
  return getProfile(userId)
}

// Xoá toàn bộ dữ liệu nhạy cảm đã khai báo (ảnh khuôn mặt, bệnh lý đã chẩn đoán, báo cáo khám) —
// đúng cam kết "người dùng có quyền yêu cầu xoá" trong tài liệu chính sách. Không xoá tài khoản.
export async function deleteSensitiveData(userId) {
  await deleteFacePhoto(userId)

  const { rows } = await query('SELECT id, file_path FROM expert_reports WHERE user_id = $1', [userId])
  for (const report of rows) {
    fs.unlink(report.file_path, () => {})
  }
  await query('DELETE FROM expert_reports WHERE user_id = $1', [userId])

  await query(
    `UPDATE profiles SET diagnosed_conditions = '[]', consent_given_at = NULL WHERE user_id = $1`,
    [userId],
  )
  await logConsentEvent(userId, 'sensitive_data_usage', false)
  return getProfile(userId)
}

export async function setFacePhoto(userId, file) {
  const { rows } = await query('SELECT face_photo_path FROM profiles WHERE user_id = $1', [userId])
  const row = rows[0]
  const ext = EXT_BY_MIME[file.mimetype] || ''
  const filename = `${crypto.randomUUID()}${ext}`
  const filePath = path.join(FACE_PHOTO_DIR, filename)
  fs.writeFileSync(filePath, file.buffer)

  if (row?.face_photo_path) {
    fs.unlink(row.face_photo_path, () => {})
  }

  await query(
    `INSERT INTO profiles (user_id, face_photo_path, face_photo_mime) VALUES ($1,$2,$3)
     ON CONFLICT(user_id) DO UPDATE SET
       face_photo_path=EXCLUDED.face_photo_path, face_photo_mime=EXCLUDED.face_photo_mime`,
    [userId, filePath, file.mimetype],
  )
  return getProfile(userId)
}

export async function deleteFacePhoto(userId) {
  const { rows } = await query('SELECT face_photo_path FROM profiles WHERE user_id = $1', [userId])
  const row = rows[0]
  if (row?.face_photo_path) {
    fs.unlink(row.face_photo_path, () => {})
  }
  await query('UPDATE profiles SET face_photo_path=NULL, face_photo_mime=NULL WHERE user_id=$1', [userId])
  return getProfile(userId)
}

// Trả về đường dẫn + mime thô trên đĩa — dùng nội bộ ở route ảnh, không qua toProfileShape.
export async function getFacePhotoFile(userId) {
  const { rows } = await query(
    'SELECT face_photo_path, face_photo_mime FROM profiles WHERE user_id=$1',
    [userId],
  )
  const row = rows[0]
  if (!row?.face_photo_path) return null
  return { path: row.face_photo_path, mime: row.face_photo_mime }
}
const MAX_DIAGNOSED_CONDITIONS = 20

export async function setDiagnosedConditions(userId, diagnosedConditions) {
  const sanitized = diagnosedConditions.slice(0, MAX_DIAGNOSED_CONDITIONS).map((entry) => ({
    name_vi: typeof entry.name_vi === 'string' ? entry.name_vi.slice(0, 200) : '',
    diagnosed_date: typeof entry.diagnosed_date === 'string' ? entry.diagnosed_date.slice(0, 20) : '',
    note: typeof entry.note === 'string' ? entry.note.slice(0, 500) : '',
  }))

  await query(
    `INSERT INTO profiles (user_id, diagnosed_conditions) VALUES ($1,$2)
     ON CONFLICT(user_id) DO UPDATE SET diagnosed_conditions=EXCLUDED.diagnosed_conditions`,
    [userId, JSON.stringify(sanitized)],
  )
  return getProfile(userId)
}
