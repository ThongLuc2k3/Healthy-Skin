import { query } from '../db/connection.js'

function toShape(row) {
  return {
    id: row.id,
    purpose: row.purpose,
    referenceId: row.reference_id,
    amountVnd: row.amount_vnd,
    provider: row.provider,
    status: row.status,
    providerRef: row.provider_ref,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }
}

// Dùng chung cho cả trang Gói Trợ Lý của người dùng (lịch sử giao dịch của chính mình) và trang
// Admin > Thành viên (xem lịch sử giao dịch của 1 thành viên bất kỳ).
export async function listTransactionsForUser(userId) {
  const { rows } = await query(
    'SELECT * FROM payment_intents WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  )
  return rows.map(toShape)
}
