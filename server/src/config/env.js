import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = dirname(fileURLToPath(import.meta.url))
const projectRootEnv = resolve(configDir, '../../../.env')
const serverEnv = resolve(configDir, '../../.env')

// `npm --prefix server ...` đổi cwd sang `server/`, vì vậy không dựa vào cwd để
// tìm .env. server/.env (nếu có) được ưu tiên, sau đó mới lấy các biến còn
// thiếu từ .env gốc. Biến môi trường do hệ điều hành/nền tảng deploy cấp luôn
// có độ ưu tiên cao nhất vì dotenv không ghi đè giá trị đã tồn tại.
dotenv.config({ path: serverEnv })
dotenv.config({ path: projectRootEnv })

const defaultCorsOrigins = ['http://localhost:5173', 'http://localhost:5174']
const corsOrigins = (process.env.CORS_ORIGIN || defaultCorsOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'da_duong_dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  aiProvider: process.env.AI_PROVIDER || 'groq',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'qwen/qwen3.6-27b',
  groqFallbackModel: process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b',
  databaseUrl: process.env.DATABASE_URL || '',
  dbPoolMax: Math.max(Number(process.env.DB_POOL_MAX) || 10, 1),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  corsOrigins,
  // Provider thanh toán đang dùng — 'mock' cho tới khi có tài khoản merchant thật (xem
  // server/src/payments/). Đổi PAYMENT_PROVIDER trong .env khi cắm cổng thật.
  paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
  // Bảo vệ tạm cho route báo cáo đối soát nội bộ (/api/settlement) — chưa có hệ vai trò admin thật,
  // dùng shared secret đơn giản. Để trống thì route từ chối mọi request, không mở public mặc định.
  adminToken: process.env.ADMIN_TOKEN || '',
}

if (!process.env.JWT_SECRET) {
  console.warn(
    '[config] JWT_SECRET chưa được cấu hình trong .env — đang dùng giá trị mặc định KHÔNG an toàn cho production.',
  )
}

if (!config.geminiApiKey) {
  console.warn(
    '[AI] GEMINI_API_KEY chưa được cấu hình — endpoint /api/scan sẽ trả lỗi 503 cho đến khi thiết lập trong .env.',
  )
}

if (config.aiProvider === 'groq' && !config.groqApiKey) {
  console.warn('[AI] GROQ_API_KEY chưa được cấu hình — chat Agent sẽ dùng Gemini dự phòng.')
}

if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
  console.warn(
    '[uploads] CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET chưa được cấu hình đủ — upload ảnh/video (đánh giá, bình luận, Góc truyền động lực) sẽ lỗi cho đến khi thiết lập trong .env. Trên Render (ổ đĩa tạm thời), ảnh lưu local sẽ mất sau mỗi lần deploy nên đây là cách lưu trữ chính, không phải tuỳ chọn.',
  )
}

export default config
