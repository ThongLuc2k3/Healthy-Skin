import jwt from 'jsonwebtoken'
import config from '../config/env.js'

// Token admin dùng chung JWT_SECRET nhưng có claim type='admin' riêng — không thể dùng lẫn với
// token người dùng thường (requireAuth) hay chuyên gia (requireExpertAuth), cùng cách expertAuth.js
// tách type='expert'.
export function signAdminToken(adminAccount) {
  return jwt.sign(
    { sub: adminAccount.id, email: adminAccount.email, type: 'admin' },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  )
}

export function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập tài khoản quản trị.' })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (payload.type !== 'admin') {
      return res.status(401).json({ error: 'Token không hợp lệ cho tài khoản quản trị.' })
    }
    req.adminId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' })
  }
}
