import jwt from 'jsonwebtoken'
import config from '../config/env.js'

// Token chuyên gia dùng chung JWT_SECRET nhưng có claim type='expert' riêng để không thể dùng lẫn
// với token tài khoản người dùng thường (requireAuth) hay ngược lại.
export function signExpertToken(expertAccount) {
  return jwt.sign(
    { sub: expertAccount.id, expertId: expertAccount.expert_id, type: 'expert' },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  )
}

export function requireExpertAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập tài khoản chuyên gia.' })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (payload.type !== 'expert') {
      return res.status(401).json({ error: 'Token không hợp lệ cho tài khoản chuyên gia.' })
    }
    req.expertAccountId = payload.sub
    req.expertId = payload.expertId
    next()
  } catch {
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' })
  }
}
