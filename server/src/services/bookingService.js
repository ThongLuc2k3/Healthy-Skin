import { query } from '../db/connection.js'
import { getExpertById } from './expertService.js'
import { getExpertReportRawById } from './expertReportService.js'
import { recordExpertBookingSettlement } from './settlementService.js'

async function toShape(row) {
  if (!row) return null
  const [expert, report] = await Promise.all([
    getExpertById(row.expert_id),
    row.consultation_report_id ? getExpertReportRawById(row.consultation_report_id) : null,
  ])
  return {
    id: row.id,
    expert: expert ? { id: expert.id, name: expert.name, specialty: expert.specialty } : null,
    slot: row.slot, status: row.status,
    consultationReport: report
      ? { id: report.id, originalName: report.original_name,
          fileUrl: `/profile/expert-report/${report.id}/file` }
      : null,
    createdAt: row.created_at,
  }
}

export async function createBooking(userId, expertId, slot) {
  const expert = await getExpertById(expertId)
  if (!expert?.available_slots.includes(slot)) return null
  const feeVnd = expert.consultation_fee_vnd || 0
  const { rows } = await query(
    `INSERT INTO expert_bookings (user_id,expert_id,slot,status,consultation_fee_vnd)
     VALUES ($1,$2,$3,'booked',$4) RETURNING *`,
    [userId, expertId, slot, feeVnd],
  )
  const booking = rows[0]
  // Ghi sổ đối soát ngay tại thời điểm đặt lịch — chỉ ghi nhận hoa hồng dự kiến trên phí niêm yết,
  // KHÔNG thu tiền thật ở bước này (xem ghi chú trong kế hoạch: thu phí tư vấn là quyết định UX
  // riêng, chưa nằm trong phạm vi đợt này). Bỏ qua lỗi ghi sổ để không chặn luồng đặt lịch chính.
  if (feeVnd > 0) {
    await recordExpertBookingSettlement(booking.id, feeVnd).catch((err) => {
      console.error('[settlement] Không ghi được sổ đối soát cho expert booking:', err)
    })
  }
  return toShape(booking)
}

export async function listBookingsForUser(userId) {
  const { rows } = await query(
    'SELECT * FROM expert_bookings WHERE user_id=$1 ORDER BY created_at DESC',
    [userId],
  )
  return Promise.all(rows.map(toShape))
}

export async function listBookingsForUserAndExpert(userId, expertId) {
  const { rows } = await query(
    'SELECT * FROM expert_bookings WHERE user_id=$1 AND expert_id=$2 ORDER BY created_at DESC',
    [userId, expertId],
  )
  return Promise.all(rows.map(toShape))
}

export async function getBookingRawById(id) {
  const { rows } = await query('SELECT * FROM expert_bookings WHERE id=$1', [id])
  return rows[0]
}

export async function getBookingForUser(userId, id) {
  const row = await getBookingRawById(id)
  if (!row || Number(row.user_id) !== Number(userId)) return null
  return toShape(row)
}

export async function linkReportToBooking(userId, bookingId, reportId) {
  const [booking, report] = await Promise.all([
    getBookingRawById(bookingId), getExpertReportRawById(reportId),
  ])
  if (!booking || Number(booking.user_id) !== Number(userId)) return null
  if (!report || Number(report.user_id) !== Number(userId)) return null
  const { rows } = await query(
    `UPDATE expert_bookings SET consultation_report_id=$1,status='completed'
     WHERE id=$2 RETURNING *`,
    [reportId, bookingId],
  )
  return toShape(rows[0])
}
