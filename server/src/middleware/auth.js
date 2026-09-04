import jwt from 'jsonwebtoken'
import config from '../config/env.js'

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.' })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' })
  }
}

// Gắn req.userId nếu có token hợp lệ, nhưng không chặn request khi thiếu/sai token —
// dùng cho các endpoint công khai nhưng muốn rate-limit công bằng theo tài khoản khi có thể.
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret)
      req.userId = payload.sub
    } catch {
      // token sai/hết hạn — bỏ qua, coi như request ẩn danh
    }
  }

  next()
}
