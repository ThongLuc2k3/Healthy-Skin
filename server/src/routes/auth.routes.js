import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { createGoogleUser, createUser, findUserByEmail, findUserById, verifyPassword } from '../services/userService.js'
import { deleteAccount } from '../services/accountDeletionService.js'
import { grantWelcomePoints } from '../services/chatWalletService.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import config from '../config/env.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const googleClient = new OAuth2Client(config.googleClientId)

router.post('/google', authLimiter, asyncHandler(async (req, res) => {
  if (!config.googleClientId) return res.status(503).json({ error: 'Đăng nhập Google chưa được cấu hình.' })
  const credential = typeof req.body?.credential === 'string' ? req.body.credential : ''
  if (!credential) return res.status(400).json({ error: 'Thiếu thông tin xác thực Google.' })

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: config.googleClientId })
    payload = ticket.getPayload()
  } catch {
    return res.status(401).json({ error: 'Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn.' })
  }
  const email = payload?.email?.trim().toLowerCase()
  if (!email || payload?.email_verified !== true) return res.status(401).json({ error: 'Tài khoản Google chưa xác minh email.' })

  let user = await findUserByEmail(email)
  const isNewUser = !user
  if (isNewUser) {
    if (req.body?.acceptedTerms !== true) return res.status(409).json({ error: 'Tài khoản mới cần đăng ký và đồng ý Điều khoản sử dụng.' })
    user = await createGoogleUser(email, new Date().toISOString())
    await grantWelcomePoints(user.id).catch((err) => console.error('[auth] Không cấp được điểm chào mừng:', err))
  }
  if (user.is_locked) return res.status(403).json({ error: `Tài khoản đã bị khoá${user.locked_reason ? `: ${user.locked_reason}` : '.'}` })
  res.json({ token: signToken(user), user: { id: user.id, email: user.email }, isNewUser })
}))

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password, acceptedTerms } = req.body ?? {}

    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Email không hợp lệ.' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' })
    }
    if (acceptedTerms !== true) {
      return res.status(400).json({ error: 'Bạn cần đồng ý với Điều khoản sử dụng trước khi đăng ký.' })
    }

    if (await findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email này đã được đăng ký.' })
    }

    const user = await createUser(email, password, new Date().toISOString())
    // Điểm chào mừng — tặng 1 lần cho mọi tài khoản mới. Không để lỗi cấp điểm chặn đăng ký thành công.
    await grantWelcomePoints(user.id).catch((err) => {
      console.error('[auth] Không cấp được điểm chào mừng:', err)
    })
    const token = signToken(user)
    res.status(201).json({ token, user: { id: user.id, email: user.email } })
  }),
)

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {}

    const user = await findUserByEmail(email)
    const passwordMatches = user && (await verifyPassword(password ?? '', user.password_hash))
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' })
    }
    if (user.is_locked) {
      return res.status(403).json({
        error: `Tài khoản đã bị khoá${user.locked_reason ? `: ${user.locked_reason}` : '.'}`,
      })
    }

    const token = signToken(user)
    res.json({ token, user: { id: user.id, email: user.email } })
  }),
)

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await findUserById(req.userId)
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' })
  }
  // Tài khoản bị khoá SAU khi đã đăng nhập (phiên JWT còn hạn) — trả 401 để AuthContext coi như
  // hết phiên và tự đăng xuất ở lần tải trang kế tiếp (xem AuthContext.jsx, chỉ xử lý status 401).
  if (user.is_locked) {
    return res.status(401).json({
      error: `Tài khoản đã bị khoá${user.locked_reason ? `: ${user.locked_reason}` : '.'}`,
    })
  }
  res.json({ id: user.id, email: user.email })
}))

// Xoá tài khoản và toàn bộ dữ liệu liên quan (hồ sơ, lịch sử quét, lịch hẹn, ảnh, đánh giá...) —
// không thể hoàn tác. Xem accountDeletionService.js để biết chính xác những gì bị xoá.
router.delete('/me', requireAuth, asyncHandler(async (req, res) => {
  await deleteAccount(req.userId)
  res.json({ ok: true })
}))

export default router
