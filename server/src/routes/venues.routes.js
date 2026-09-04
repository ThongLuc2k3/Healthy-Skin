import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  listVenues,
  listCategories,
  getVenueById,
  listServicesForVenue,
  listVenueReviews,
  bookService,
  listBookingsForUser,
  getBookingForUser,
} from '../services/venueService.js'
import { createVenueApplication } from '../services/venueApplicationService.js'
import { resolveApproxCoords } from '../data/vnAreaCoords.js'

const router = Router()

function parseCoord(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

// Ưu tiên toạ độ GPS thật từ trình duyệt — chỉ dùng địa chỉ tự khai (mô phỏng theo quận/huyện) khi
// không có lat/lng, ví dụ người dùng từ chối quyền vị trí (xem ghi chú trong vnAreaCoords.js).
function resolveCoords(req) {
  const lat = parseCoord(req.query.lat)
  const lng = parseCoord(req.query.lng)
  if (lat !== undefined && lng !== undefined) return { lat, lng }
  if (req.query.address) {
    const approx = resolveApproxCoords(String(req.query.address))
    if (approx) return approx
  }
  return { lat: undefined, lng: undefined }
}

router.get('/', asyncHandler(async (req, res) => {
  const { lat, lng } = resolveCoords(req)
  res.json(await listVenues(req.query.category, lat, lng))
}))

router.get('/categories', asyncHandler(async (req, res) => {
  res.json(await listCategories())
}))

// Công khai, không cần đăng nhập — chủ cửa hàng nộp hồ sơ, vào 'pending' chờ Admin duyệt
// (xem adminService/venueApplicationService.reviewVenueApplication).
router.post('/apply', asyncHandler(async (req, res) => {
  const application = await createVenueApplication(req.body ?? {})
  if (!application) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' })
  }
  res.status(201).json(application)
}))

router.get('/bookings/mine', requireAuth, asyncHandler(async (req, res) => {
  res.json(await listBookingsForUser(req.userId))
}))

router.get('/bookings/:bookingId', requireAuth, asyncHandler(async (req, res) => {
  const booking = await getBookingForUser(req.userId, Number(req.params.bookingId))
  if (!booking) {
    return res.status(404).json({ error: 'Không tìm thấy lịch đặt dịch vụ.' })
  }
  res.json(booking)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const { lat, lng } = resolveCoords(req)
  const venue = await getVenueById(req.params.id, lat, lng)
  if (!venue) {
    return res.status(404).json({ error: 'Không tìm thấy trung tâm.' })
  }
  const services = await listServicesForVenue(req.params.id)
  res.json({ ...venue, services })
}))

router.get('/:id/reviews', asyncHandler(async (req, res) => {
  res.json(await listVenueReviews(req.params.id))
}))

router.post('/services/:serviceId/book', requireAuth, asyncHandler(async (req, res) => {
  const serviceId = Number(req.params.serviceId)
  const { userVoucherId } = req.body ?? {}
  if (!Number.isInteger(serviceId)) {
    return res.status(400).json({ error: 'Dịch vụ không hợp lệ.' })
  }

  const booking = await bookService(req.userId, serviceId, {
    userVoucherId: userVoucherId ? Number(userVoucherId) : null,
  })
  if (!booking) {
    return res.status(400).json({ error: 'Không thể đặt dịch vụ này.' })
  }
  res.status(201).json(booking)
}))

export default router
