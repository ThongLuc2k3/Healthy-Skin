import express from 'express'
import http from 'node:http'
import cors from 'cors'
import helmet from 'helmet'
import bcrypt from 'bcrypt'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import config from './config/env.js'
import { initDatabase, query } from './db/connection.js'
import { attachConsultationHub } from './ws/consultationHub.js'
import { seed, seedExperts, seedSponsoredContent, seedVenuesAndVouchers, seedWebsiteReviews, seedVenueApplications, seedExpertApplications, seedHistoricalActivity, seedUserVouchers, seedVenueReviews } from './db/seed.js'
import { listSkincareItems } from './services/itemService.js'
import { listExperts } from './services/expertService.js'
import { seedExpertAccounts } from './services/expertAccountService.js'
import { seedAdminAccount, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from './services/adminAccountService.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import { generalLimiter } from './middleware/rateLimit.js'
import authRoutes from './routes/auth.routes.js'
import profileRoutes from './routes/profile.routes.js'
import accountRoutes from './routes/account.routes.js'
import itemsRoutes from './routes/items.routes.js'
import scanRoutes from './routes/scan.routes.js'
import explainRoutes from './routes/explain.routes.js'
import chatRoutes from './routes/chat.routes.js'
import expertsRoutes from './routes/experts.routes.js'
import expertPortalRoutes from './routes/expertPortal.routes.js'
import reviewRoutes from './routes/review.routes.js'
import sponsoredRoutes from './routes/sponsored.routes.js'
import venuesRoutes from './routes/venues.routes.js'
import motivationRoutes from './routes/motivation.routes.js'
import usersRoutes from './routes/users.routes.js'
import vouchersRoutes from './routes/vouchers.routes.js'
import settlementRoutes from './routes/settlement.routes.js'
import adminRoutes from './routes/admin.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDistPath = path.resolve(__dirname, '../../dist')
const clientIndexPath = path.join(clientDistPath, 'index.html')
const hasClientBuild = fs.existsSync(clientIndexPath)

await initDatabase()

if ((await listSkincareItems()).length === 0) {
  const { skincareCount, foodCount } = await seed()
  console.log(`[db] Đã tự động seed dữ liệu ban đầu: ${skincareCount} skincare, ${foodCount} food.`)
}

// seedExperts/seedSponsoredContent/seedVenuesAndVouchers dùng ON CONFLICT DO UPDATE trên id, nên
// chạy lại mỗi lần khởi động là an toàn — đảm bảo khi sửa file data/*.json (thêm chuyên gia, đổi
// tên đối tác...) thì DB dev cục bộ luôn đồng bộ mà không cần xoá bảng thủ công.
const { expertsCount } = await seedExperts()
console.log(`[db] Đã đồng bộ dữ liệu chuyên gia: ${expertsCount} chuyên gia.`)
const experts = await listExperts()
if (experts.length > 0) {
  await seedExpertAccounts(experts.map((e) => e.id))
  console.log(`[db] Đã đồng bộ tài khoản đăng nhập cho ${experts.length} chuyên gia.`)
}

const { productsCount, adsCount } = await seedSponsoredContent()
console.log(`[db] Đã đồng bộ dữ liệu tiếp thị liên kết: ${productsCount} sản phẩm, ${adsCount} quảng cáo.`)

const { venuesCount, servicesCount, vouchersCount } = await seedVenuesAndVouchers()
console.log(`[db] Đã đồng bộ dữ liệu Dịch Vụ Quanh Bạn: ${venuesCount} trung tâm, ${servicesCount} dịch vụ, ${vouchersCount} voucher.`)

const { reviewsCount: venueReviewsCount } = await seedVenueReviews()
if (venueReviewsCount > 0) {
  console.log(`[db] Đã tự động seed đánh giá Dịch Vụ Quanh Bạn: ${venueReviewsCount} đánh giá.`)
}

const { rows: reviewCountRows } = await query('SELECT COUNT(*)::int AS count FROM website_reviews')
if (reviewCountRows[0].count === 0) {
  const { reviewsCount } = await seedWebsiteReviews()
  console.log(`[db] Đã tự động seed đánh giá website: ${reviewsCount} đánh giá.`)
}

const { applicationsCount } = await seedVenueApplications()
if (applicationsCount > 0) {
  console.log(`[db] Đã tự động seed đơn đăng ký đối tác: ${applicationsCount} đơn.`)
}

const { applicationsCount: expertApplicationsCount } = await seedExpertApplications()
if (expertApplicationsCount > 0) {
  console.log(`[db] Đã tự động seed đơn ứng tuyển chuyên gia: ${expertApplicationsCount} đơn.`)
}

const { seeded: historicalSeeded } = await seedHistoricalActivity()
if (historicalSeeded) {
  console.log('[db] Đã tự động seed lịch sử giao dịch/lịch hẹn mẫu.')
}

const { grantedCount } = await seedUserVouchers()
if (grantedCount > 0) {
  console.log(`[db] Đã cấp thêm ${grantedCount} voucher cho các thành viên chưa đủ ${10} voucher.`)
}

await seedAdminAccount()
console.log(`[db] Tài khoản Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`)

const app = express()
app.set('trust proxy', 1)

function isLoopbackOrigin(origin) {
  try {
    const url = new URL(origin)
    return ['localhost', '127.0.0.1'].includes(url.hostname)
  } catch {
    return false
  }
}

// Ảnh/video người dùng tự tải lên (đánh giá, bình luận, Góc truyền động lực) giờ nhúng thẳng URL
// Cloudinary vào <img>/<video> trên trang — Content-Security-Policy mặc định của helmet() chỉ cho
// phép img-src/media-src 'self' nên sẽ ÂM THẦM CHẶN trình duyệt hiển thị ảnh dù URL trả về 200 OK
// bình thường (mở thẳng URL ở tab mới thì không bị chặn vì CSP chỉ áp dụng cho tài nguyên NHÚNG
// trong trang, không áp dụng khi điều hướng trực tiếp — đúng triệu chứng đã gặp: ảnh vỡ trên trang
// nhưng mở link ảnh ở tab riêng lại được).
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
      'media-src': ["'self'", 'https://res.cloudinary.com'],
    },
  },
}))
const corsMiddleware = cors({
  origin(origin, callback) {
    // Cho phép request không có Origin (curl, healthcheck, server-to-server)
    // và nhiều cổng localhost khi Vite tự tăng port do cổng mặc định đang bận.
    if (!origin || config.corsOrigins.includes(origin) || isLoopbackOrigin(origin)) {
      callback(null, true)
      return
    }
    callback(new Error(`CORS origin không được phép: ${origin}`))
  },
})

app.use((req, res, next) => {
  const origin = req.get('origin')
  const requestOrigin = `${req.protocol}://${req.get('host')}`

  if (!origin || origin === requestOrigin) {
    next()
    return
  }

  corsMiddleware(req, res, next)
})
app.use(express.json({ limit: '50kb' }))
app.use('/api', generalLimiter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/scan', scanRoutes)
app.use('/api/explain', explainRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/experts', expertsRoutes)
app.use('/api/expert-portal', expertPortalRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/sponsored', sponsoredRoutes)
app.use('/api/venues', venuesRoutes)
app.use('/api/motivation', motivationRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/vouchers', vouchersRoutes)
app.use('/api/settlement', settlementRoutes)
app.use('/api/admin', adminRoutes)
// /uploads (ảnh/video công khai: review, motivation post...) phải luôn có 2 header nới lỏng này để
// trình duyệt cho phép hiển thị khi frontend dùng URL TUYỆT ĐỐI trỏ thẳng backend (VITE_API_BASE_URL
// có set, ví dụ chạy qua dev-all.mjs) — lúc đó ảnh là cross-origin thật với trang, và helmet() mặc
// định set Cross-Origin-Resource-Policy: same-origin sẽ khiến trình duyệt ÂM THẦM CHẶN hiển thị ảnh
// dù request HTTP vẫn trả 200 OK bình thường (không có lỗi network để thấy). Phải đặt middleware này
// TRƯỚC express.static('public') chung bên dưới — nếu không, static('public') sẽ tự phục vụ trước
// (vì public/uploads/... vẫn nằm trong public/) và thiếu mất 2 header, y hệt lỗi vừa gặp.
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  },
  express.static(path.join(process.cwd(), 'public/uploads')),
)
app.use(express.static(path.join(process.cwd(), 'public')))
app.use(cors())

if (hasClientBuild) {
  app.use(express.static(clientDistPath))

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/') || path.extname(req.path) || !req.accepts('html')) {
      next()
      return
    }

    res.sendFile(clientIndexPath, (error) => {
      if (error) next(error)
    })
  })
}

app.use(notFoundHandler)
app.use(errorHandler)

const server = http.createServer(app)
attachConsultationHub(server)

server.listen(config.port, () => {
  console.log(`[server] HEALTHY SKIN backend đang chạy tại http://localhost:${config.port}`)

  // "Làm nóng" bcrypt native (threadpool libuv) để request đăng ký/đăng nhập đầu tiên
  // của người dùng thật không phải gánh chi phí khởi tạo — chạy nền, không chặn gì cả.
  bcrypt.hash('warmup', 10).catch(() => { })
})
