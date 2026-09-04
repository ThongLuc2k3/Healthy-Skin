import { Router } from 'express'
import upload from '../middleware/upload.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireExpertAuth, signExpertToken } from '../middleware/expertAuth.js'
import { authenticateExpert } from '../services/expertAccountService.js'
import {
  listThreadsForExpert,
  getThreadForExpert,
  listMessages,
  postExpertMessage,
  getMessageRawById,
} from '../services/consultationService.js'
import { broadcastMessage } from '../ws/consultationHub.js'
import { listProposalsForExpert, respondToProposal } from '../services/expertProposalService.js'

const router = Router()

// --- DEMO: Expert Dashboard ---
// Đăng nhập bằng mật khẩu demo cố định (xem expertAccountService.DEMO_EXPERT_PASSWORD), chỉ để
// trình diễn luồng bác sĩ xem hồ sơ + nhắn tin, KHÔNG phải cơ chế xác thực đối tác thật.

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' })
  }

  const result = await authenticateExpert(email, password)
  if (!result) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' })
  }

  const token = signExpertToken(result.account)
  res.json({ token, expert: result.expert })
}))

router.get('/bookings', requireExpertAuth, asyncHandler(async (req, res) => {
  res.json(await listThreadsForExpert(req.expertId))
}))

router.get('/proposals', requireExpertAuth, asyncHandler(async (req, res) => {
  res.json(await listProposalsForExpert(req.expertId))
}))

router.post('/proposals/:proposalId/respond', requireExpertAuth, asyncHandler(async (req, res) => {
  const { accept, note } = req.body ?? {}
  const proposal = await respondToProposal(req.expertId, Number(req.params.proposalId), Boolean(accept), note)
  if (!proposal) {
    return res.status(400).json({ error: 'Không tìm thấy đề xuất đang chờ xử lý.' })
  }
  res.json(proposal)
}))

router.get('/bookings/:bookingId/thread', requireExpertAuth, asyncHandler(async (req, res) => {
  const result = await getThreadForExpert(req.expertId, Number(req.params.bookingId))
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện tư vấn.' })
  }
  const messages = await listMessages(result.thread.id)
  res.json({
    status: result.thread.status,
    profileSnapshot: JSON.parse(result.thread.profile_snapshot),
    messages,
  })
}))

router.post(
  '/bookings/:bookingId/thread/messages',
  requireExpertAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, 1000) : ''
    const recommendedProductId = typeof req.body?.recommendedProductId === 'string'
      ? req.body.recommendedProductId.slice(0, 100)
      : ''

    if (!text && !req.file) {
      return res.status(400).json({ error: 'Vui lòng nhập tin nhắn hoặc đính kèm ảnh.' })
    }

    const result = await getThreadForExpert(req.expertId, Number(req.params.bookingId))
    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện tư vấn.' })
    }

    const message = await postExpertMessage(result.thread.id, {
      text,
      file: req.file,
      recommendedProductId,
    })
    broadcastMessage(result.thread.id, message)
    res.status(201).json(message)
  }),
)

// Ảnh chuyên gia tự gửi — chỉ phục vụ cho đúng chuyên gia sở hữu cuộc trò chuyện đó.
router.get('/consultations/:bookingId/messages/:messageId/image', requireExpertAuth, asyncHandler(async (req, res) => {
  const result = await getThreadForExpert(req.expertId, Number(req.params.bookingId))
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy ảnh.' })
  }
  const message = await getMessageRawById(Number(req.params.messageId))
  if (!message?.image_path || message.thread_id !== result.thread.id) {
    return res.status(404).json({ error: 'Không tìm thấy ảnh.' })
  }
  res.setHeader('Content-Type', message.image_mime || 'image/jpeg')
  res.sendFile(message.image_path)
}))

export default router
