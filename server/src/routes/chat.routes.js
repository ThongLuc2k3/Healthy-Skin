import { Router } from 'express'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { chatLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { chatReply } from '../services/chatService.js'
import { getFastChatReply } from '../services/fastChatService.js'
import { getAppointmentFallbackReply } from '../services/appointmentFallbackService.js'
import { GeminiNotConfiguredError, GeminiRequestError } from '../services/geminiService.js'
import { AgentProviderError } from '../services/agentClient.js'
import { classifyChatIntent } from '../services/intentRouterService.js'
import {
  CHAT_PLANS,
  consumeChatQuestion,
  getWalletStatus,
  topupWallet,
  purchasePlan,
} from '../services/chatWalletService.js'
import { awardVoucher } from '../services/voucherService.js'
import { listTransactionsForUser } from '../services/paymentIntentService.js'

const PACKAGE_BONUS_VOUCHER_ID = 'voucher_goi_tro_ly'

const router = Router()

router.post(
  '/',
  optionalAuth,
  chatLimiter,
  asyncHandler(async (req, res) => {
    const { messages, context } = req.body ?? {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Thiếu nội dung tin nhắn.' })
    }
    const hasInvalidMessage = messages.some(
      (m) =>
        !m ||
        typeof m.text !== 'string' ||
        !m.text.trim() ||
        !['user', 'assistant'].includes(m.role),
    )
    if (hasInvalidMessage) {
      return res.status(400).json({ error: 'Dữ liệu tin nhắn không hợp lệ.' })
    }

    const intent = await classifyChatIntent(messages)
    const fastReply = await getFastChatReply(messages, intent)
    if (fastReply) {
      const walletStatus = req.userId ? await getWalletStatus(req.userId) : null
      return res.json({ ...fastReply, intent, wallet: walletStatus })
    }

    // Ẩn danh (chưa đăng nhập) không có ví/gói riêng — chỉ bị giới hạn theo chatLimiter (IP).
    let walletStatus = null
    if (req.userId) {
      const quota = await consumeChatQuestion(req.userId)
      walletStatus = quota.status
      if (!quota.allowed) {
        return res.status(200).json({
          reply: null,
          quotaExceeded: true,
          wallet: walletStatus,
        })
      }
    }

    // Luồng đặt lịch nhiều lượt có bộ xử lý nội bộ dựa trên dữ liệu thật. Chạy sau bước tính quota
    // nhưng trước LLM để “rẻ nhất”, “chiều mát”, “xác nhận” không bị gọi lại tool tìm kiếm/RAG.
    const appointmentReply = await getAppointmentFallbackReply(messages, {
      ...(context ?? {}), userId: req.userId || null,
    })
    if (appointmentReply) return res.json({ ...appointmentReply, intent, wallet: walletStatus })

    let reply
    try {
      const latestUserText = [...messages].reverse().find((message) => message.role === 'user')?.text || ''
      reply = await chatReply(messages, { ...(context ?? {}), userId: req.userId || null, latestUserText })
    } catch (err) {
      if (err instanceof AgentProviderError) {
        console.error('[chat/Agent]', err.message)
        const fallback = await getAppointmentFallbackReply(messages, { ...(context ?? {}), userId: req.userId || null })
        if (fallback) return res.status(200).json({ ...fallback, wallet: walletStatus })
        return res.status(err.quotaExceeded ? 429 : 502).json({ error: err.message })
      }
      if (err instanceof GeminiNotConfiguredError) {
        return res.status(503).json({
          error: 'Trợ lý chưa sẵn sàng, thiếu cấu hình Gemini API key.',
        })
      }
      if (err instanceof GeminiRequestError) {
        console.error('[chat/Gemini]', err.message)
        const fallback = await getAppointmentFallbackReply(messages, {
          ...(context ?? {}), userId: req.userId || null,
        })
        if (fallback) return res.status(200).json({ ...fallback, wallet: walletStatus })
        return res.status(err.quotaExceeded ? 429 : 502).json({
          error: err.quotaExceeded
            ? 'Gemini đã hết hạn mức API hiện tại. Bạn chờ rồi thử lại, hoặc tiếp tục dùng các lệnh đặt lịch được xử lý nội bộ.'
            : 'Không thể kết nối Gemini lúc này, vui lòng thử lại.',
        })
      }
      throw err
    }

    res.json({ ...reply, responseMode: 'agent', intent, wallet: walletStatus })
  }),
)

router.get('/wallet', requireAuth, asyncHandler(async (req, res) => {
  res.json(await getWalletStatus(req.userId))
}))

router.get('/wallet/transactions', requireAuth, asyncHandler(async (req, res) => {
  res.json(await listTransactionsForUser(req.userId))
}))

router.get('/plans', (req, res) => {
  res.json(CHAT_PLANS)
})

// Nạp ví — DEMO, không tích hợp cổng thanh toán thật, chỉ cộng thẳng số dư + điểm tích luỹ.
router.post('/topup', requireAuth, asyncHandler(async (req, res) => {
  const amount = Number(req.body?.amountVnd)
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Số tiền nạp không hợp lệ.' })
  }
  res.json(await topupWallet(req.userId, amount))
}))

// Mua Gói Trợ Lý — DEMO, không tích hợp cổng thanh toán thật, chỉ cộng thẳng quota đã mua.
router.post('/upgrade', requireAuth, asyncHandler(async (req, res) => {
  const { planId } = req.body ?? {}
  if (!CHAT_PLANS.some((p) => p.id === planId)) {
    return res.status(400).json({ error: 'Gói Trợ Lý không hợp lệ.' })
  }
  const status = await purchasePlan(req.userId, planId)
  // Tặng kèm voucher khi mua gói — không để lỗi cấp voucher làm hỏng giao dịch mua gói chính. Trả
  // kèm tên voucher trong response để frontend thông báo rõ ràng, tránh người dùng tưởng nhầm là
  // "thanh toán xong mà chẳng thấy gì" (voucher trước đây vẫn được cấp đúng, chỉ là không hiện ra).
  const bonusVoucher = await awardVoucher(req.userId, PACKAGE_BONUS_VOUCHER_ID, 'package_bonus').catch(() => null)
  res.json({ ...status, bonusVoucherTitle: bonusVoucher?.voucherTitle ?? null })
}))

export default router
