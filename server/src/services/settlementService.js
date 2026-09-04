import { query as poolQuery } from '../db/connection.js'
import { EXPERT_COMMISSION_RATE, VENUE_COMMISSION_RATE, computeCommission } from '../config/pricing.js'

// Sổ đối soát (demo): ghi tách bạch hoa hồng nền tảng / phần trả đối tác cho MỖI booking sinh doanh
// thu, để có bằng chứng minh bạch khi làm việc với đối tác/mentor thật, dù thanh toán vẫn đang mock.
//
// `db` mặc định là hàm query dùng pool chung; truyền `client.query.bind(client)` khi cần chạy trong
// cùng 1 transaction đã mở sẵn ở nơi gọi (venueService.bookService đang làm vậy để tránh race
// condition, giống cách voucher double-apply từng được sửa).

async function insertSettlement(db, bookingType, bookingId, grossAmountVnd, rate) {
  const commission = computeCommission(grossAmountVnd, rate)
  const payout = grossAmountVnd - commission
  await db(
    `INSERT INTO settlement_records (booking_type, booking_id, gross_amount_vnd, commission_vnd, payout_vnd, status, settled_at)
     VALUES ($1,$2,$3,$4,$5,'settled',NOW())`,
    [bookingType, bookingId, grossAmountVnd, commission, payout],
  )
  return { commission, payout }
}

export async function recordExpertBookingSettlement(bookingId, grossAmountVnd, { db = poolQuery } = {}) {
  const { commission, payout } = await insertSettlement(db, 'expert', bookingId, grossAmountVnd, EXPERT_COMMISSION_RATE)
  await db('UPDATE expert_bookings SET platform_commission_vnd = $2 WHERE id = $1', [bookingId, commission])
  return { commission, payout }
}

export async function recordVenueBookingSettlement(bookingId, grossAmountVnd, { db = poolQuery } = {}) {
  const { commission, payout } = await insertSettlement(db, 'venue', bookingId, grossAmountVnd, VENUE_COMMISSION_RATE)
  await db(
    'UPDATE venue_bookings SET platform_commission_vnd = $2, partner_payout_vnd = $3 WHERE id = $1',
    [bookingId, commission, payout],
  )
  return { commission, payout }
}

export async function getSettlementSummary({ from, to } = {}) {
  const conditions = []
  const params = []
  if (from) {
    params.push(from)
    conditions.push(`created_at >= $${params.length}`)
  }
  if (to) {
    params.push(to)
    conditions.push(`created_at <= $${params.length}`)
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await poolQuery(
    `SELECT booking_type,
            COUNT(*)::int AS booking_count,
            COALESCE(SUM(gross_amount_vnd),0)::int AS gross_total_vnd,
            COALESCE(SUM(commission_vnd),0)::int AS commission_total_vnd,
            COALESCE(SUM(payout_vnd),0)::int AS payout_total_vnd
     FROM settlement_records
     ${where}
     GROUP BY booking_type
     ORDER BY booking_type`,
    params,
  )
  return rows
}
