import { query } from '../db/connection.js'
import { getProvider } from '../payments/provider.js'

// Số câu hỏi Trợ Lý miễn phí mỗi ngày cho tài khoản chưa mua thêm gói.
export const FREE_DAILY_QUESTIONS = 5

// Nạp ví theo demo: quy đổi 0,01% số tiền nạp thành điểm tích luỹ, tức 10.000đ = 1 điểm (100.000đ =
// 10 điểm) — KHÔNG phải 10% (0.1 sẽ ra 100.000đ = 10.000 điểm, lạm phát điểm quá nhiều so với giá
// voucher). Mua Gói Trợ Lý cũng quy đổi theo cùng tỷ lệ này (xem purchasePlan) — trước đây chỉ nạp
// ví mới có điểm, khiến người mua gói tưởng nhầm là lỗi vì "thanh toán xong mà không thấy gì đổi khác".
const POINTS_PER_VND = 0.0001

// Điểm tặng chào mừng — cấp 1 lần cho mọi tài khoản (user mới lúc đăng ký, xem auth.routes.js; user
// cũ được cấp bù 1 lần qua script backfill, xem server/scripts/grantWelcomePoints.js).
export const WELCOME_POINTS = 1000

export async function grantWelcomePoints(userId, points = WELCOME_POINTS) {
  await query(
    `INSERT INTO user_wallets (user_id, loyalty_points) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET loyalty_points = user_wallets.loyalty_points + $2, updated_at = NOW()`,
    [userId, points],
  )
}

// Các gói Trợ Lý demo — mua xong cộng thẳng số câu vào "kho câu hỏi đã mua", trừ dần khi hết
// quota miễn phí trong ngày. Giá/số câu chỉ mang tính minh hoạ, chưa chốt công thức tính phí thật.
export const CHAT_PLANS = [
  { id: 'basic_10', name: 'Gói Trợ Lý 10 câu', questionQuota: 10, priceVnd: 15000 },
  { id: 'plus_30', name: 'Gói Trợ Lý 30 câu', questionQuota: 30, priceVnd: 39000 },
  { id: 'pro_100', name: 'Gói Trợ Lý 100 câu', questionQuota: 100, priceVnd: 109000 },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

async function getOrCreateWallet(userId) {
  const { rows } = await query('SELECT * FROM user_wallets WHERE user_id = $1', [userId])
  if (rows[0]) return rows[0]

  const inserted = await query(
    `INSERT INTO user_wallets (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING *`,
    [userId],
  )
  return inserted.rows[0]
}

// Cộng/trừ điểm tích luỹ trực tiếp, không qua nạp ví — dùng cho các nguồn điểm khác, ví dụ điểm
// thưởng từ lượt xem/tim bài đăng ở Góc truyền động lực (xem motivationPostService.js). GREATEST
// chặn điểm âm khi trừ (bỏ tim) vượt quá số điểm đang có.
export async function addLoyaltyPoints(userId, delta) {
  await getOrCreateWallet(userId)
  await query(
    `UPDATE user_wallets SET loyalty_points = GREATEST(loyalty_points + $2, 0), updated_at = NOW() WHERE user_id = $1`,
    [userId, delta],
  )
}

async function getOrCreateUsageToday(userId) {
  const date = todayStr()
  const { rows } = await query(
    'SELECT * FROM chat_usage_log WHERE user_id = $1 AND date = $2',
    [userId, date],
  )
  if (rows[0]) return rows[0]

  const inserted = await query(
    `INSERT INTO chat_usage_log (user_id, date) VALUES ($1, $2)
     ON CONFLICT (user_id, date) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING *`,
    [userId, date],
  )
  return inserted.rows[0]
}

function toWalletShape(walletRow, usageRow) {
  const askedToday = usageRow?.question_count || 0
  const remainingFree = Math.max(FREE_DAILY_QUESTIONS - askedToday, 0)
  return {
    balanceVnd: walletRow?.balance_vnd || 0,
    loyaltyPoints: walletRow?.loyalty_points || 0,
    planId: walletRow?.plan_id || 'free',
    purchasedQuestionsRemaining: walletRow?.purchased_questions_remaining || 0,
    askedToday,
    remainingFreeToday: remainingFree,
  }
}

export async function getWalletStatus(userId) {
  const [wallet, usage] = await Promise.all([getOrCreateWallet(userId), getOrCreateUsageToday(userId)])
  return toWalletShape(wallet, usage)
}

// Kiểm tra + ghi nhận một lượt hỏi Trợ Lý. Trả về { allowed, status }. Ưu tiên trừ vào quota
// miễn phí trong ngày trước, hết thì trừ vào kho câu hỏi đã mua; hết cả hai thì allowed=false
// để route trả lời gợi ý nâng cấp gói/đặt lịch chuyên gia thay vì lỗi chung chung.
export async function consumeChatQuestion(userId) {
  const wallet = await getOrCreateWallet(userId)
  const usage = await getOrCreateUsageToday(userId)

  if (usage.question_count < FREE_DAILY_QUESTIONS) {
    const updated = await query(
      `UPDATE chat_usage_log SET question_count = question_count + 1
       WHERE user_id = $1 AND date = $2 RETURNING *`,
      [userId, todayStr()],
    )
    return { allowed: true, status: toWalletShape(wallet, updated.rows[0]) }
  }

  if (wallet.purchased_questions_remaining > 0) {
    const updatedWallet = await query(
      `UPDATE user_wallets SET purchased_questions_remaining = purchased_questions_remaining - 1,
       updated_at = NOW() WHERE user_id = $1 RETURNING *`,
      [userId],
    )
    return { allowed: true, status: toWalletShape(updatedWallet.rows[0], usage) }
  }

  return { allowed: false, status: toWalletShape(wallet, usage) }
}

export async function topupWallet(userId, amountVnd) {
  const amount = Math.max(Math.floor(Number(amountVnd) || 0), 0)
  if (amount <= 0) {
    throw new Error('Số tiền nạp không hợp lệ.')
  }

  // Đi qua payment_intents thay vì cộng thẳng ví — với provider mock thì vẫn xác nhận tức thì như
  // trước, nhưng khi cắm cổng thật sau này chỉ cần provider trả status khác 'succeeded' để chặn ở đây.
  const intent = await getProvider().createIntent({
    userId, purpose: 'wallet_topup', referenceId: null, amountVnd: amount,
  })
  if (intent.status !== 'succeeded') {
    throw new Error('Giao dịch nạp ví đang chờ xác nhận từ cổng thanh toán.')
  }

  const points = Math.floor(amount * POINTS_PER_VND)

  await getOrCreateWallet(userId)
  const { rows } = await query(
    `UPDATE user_wallets
     SET balance_vnd = balance_vnd + $2, loyalty_points = loyalty_points + $3, updated_at = NOW()
     WHERE user_id = $1 RETURNING *`,
    [userId, amount, points],
  )

  const usage = await getOrCreateUsageToday(userId)
  return {
    ...toWalletShape(rows[0], usage),
    transactionRef: intent.providerRef,
    paidAt: intent.completedAt,
    pointsEarned: points,
  }
}

export async function purchasePlan(userId, planId) {
  const plan = CHAT_PLANS.find((p) => p.id === planId)
  if (!plan) {
    throw new Error('Gói Trợ Lý không hợp lệ.')
  }

  const intent = await getProvider().createIntent({
    userId, purpose: 'plan_purchase', referenceId: plan.id, amountVnd: plan.priceVnd,
  })
  if (intent.status !== 'succeeded') {
    throw new Error('Giao dịch mua gói đang chờ xác nhận từ cổng thanh toán.')
  }

  const points = Math.floor(plan.priceVnd * POINTS_PER_VND)

  await getOrCreateWallet(userId)
  const { rows } = await query(
    `UPDATE user_wallets
     SET plan_id = $2, purchased_questions_remaining = purchased_questions_remaining + $3,
     loyalty_points = loyalty_points + $4, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
    [userId, plan.id, plan.questionQuota, points],
  )

  const usage = await getOrCreateUsageToday(userId)
  return {
    ...toWalletShape(rows[0], usage),
    transactionRef: intent.providerRef,
    paidAt: intent.completedAt,
    pointsEarned: points,
  }
}
