import crypto from 'node:crypto'
import { query } from '../db/connection.js'

// Provider demo — KHÔNG có tiền thật di chuyển. Ghi lại payment_intents đúng như một cổng thật sẽ
// cần (ai trả, trả cho việc gì, bao nhiêu), nhưng xác nhận thành công ngay lập tức thay vì chờ
// redirect/webhook thật. Giữ đúng trải nghiệm demo hiện tại (tức thì) trong lúc chưa có merchant.
//
// provider_ref mô phỏng mã giao dịch mà một cổng thật (VNPay/Momo/...) sẽ trả về — sinh ở đây thay
// vì để trống, để màn hình xác nhận thanh toán có mã tra cứu giống trải nghiệm thật thay vì trơ.
function generateProviderRef() {
  return `HSPAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

export const mockProvider = {
  async createIntent({ userId, purpose, referenceId, amountVnd }) {
    const providerRef = generateProviderRef()
    const { rows } = await query(
      `INSERT INTO payment_intents (user_id, purpose, reference_id, amount_vnd, provider, status, provider_ref, completed_at)
       VALUES ($1,$2,$3,$4,'mock','succeeded',$5,NOW()) RETURNING id, status, provider_ref, completed_at`,
      [userId, purpose, referenceId ?? null, amountVnd, providerRef],
    )
    return { intentId: rows[0].id, status: rows[0].status, providerRef: rows[0].provider_ref, completedAt: rows[0].completed_at }
  },

  async getStatus(intentId) {
    const { rows } = await query('SELECT status FROM payment_intents WHERE id = $1', [intentId])
    return { status: rows[0]?.status ?? 'unknown' }
  },
}
