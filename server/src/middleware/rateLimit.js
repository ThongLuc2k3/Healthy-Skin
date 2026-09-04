import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.' },
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều lần thử, vui lòng thử lại sau 15 phút.' },
})

function userOrIpKey(req) {
  return req.userId ? String(req.userId) : ipKeyGenerator(req.ip)
}

// Gemini free tier chỉ có 1.500 request/ngày dùng chung cho cả ứng dụng —
// giới hạn theo từng tài khoản để một người dùng không thể chiếm hết quota chung.
export const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'Bạn đã quét quá nhiều lần trong thời gian ngắn, vui lòng thử lại sau ít phút.' },
})

export const explainLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'Bạn đã yêu cầu giải thích quá nhiều lần, vui lòng thử lại sau ít phút.' },
})

export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'Bạn đã nhắn quá nhiều tin trong thời gian ngắn, vui lòng thử lại sau ít phút.' },
})

export const profileUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: { error: 'Bạn đã tải lên quá nhiều lần trong thời gian ngắn, vui lòng thử lại sau ít phút.' },
})
