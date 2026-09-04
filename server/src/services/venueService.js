import crypto from 'node:crypto'
import { query, transaction } from '../db/connection.js'
import { computeDiscountedPrice } from '../logic/voucherPricing.js'
import { getProvider } from '../payments/provider.js'
import { recordVenueBookingSettlement } from './settlementService.js'

function toVenueShape(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    addressVi: row.address_vi,
    areaVi: row.area_vi,
    descriptionVi: row.description_vi,
    coverImageUrl: row.cover_image_url,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    ratingAvg: Number(row.rating_avg ?? 0),
    reviewCount: Number(row.review_count ?? 0),
  }
}

const EARTH_RADIUS_KM = 6371

// Công thức Haversine — tính ở JS thay vì SQL vì danh sách venue rất nhỏ (vài chục dòng), không
// đáng thêm biểu thức lượng giác phức tạp vào câu query cho một lần tính không tốn kém.
function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a))
}

function withDistance(venues, userLat, userLng) {
  if (userLat == null || userLng == null) return venues
  const withDist = venues.map((v) => ({
    ...v,
    distanceKm: v.latitude != null && v.longitude != null
      ? Math.round(haversineKm(userLat, userLng, v.latitude, v.longitude) * 10) / 10
      : null,
  }))
  return withDist.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
}

// Không trả về danh tính người đánh giá (chỉ rating + nội dung), giống cách reviews của chuyên gia
// chỉ hiện user_display chứ không lộ email tài khoản thật.
function toVenueReviewShape(row) {
  return {
    id: row.id,
    rating: row.rating,
    commentVi: row.comment_vi,
    createdAt: row.created_at,
  }
}

function toServiceShape(row) {
  return {
    id: row.id,
    venueId: row.venue_id,
    nameVi: row.name_vi,
    priceVnd: row.price_vnd,
    durationMinutes: row.duration_minutes,
  }
}

function toBookingShape(row) {
  return {
    id: row.id,
    serviceId: row.service_id,
    userVoucherId: row.user_voucher_id,
    scheduledAt: row.scheduled_at,
    finalPriceVnd: row.final_price_vnd,
    status: row.status,
    invoiceCode: row.invoice_code,
    createdAt: row.created_at,
  }
}

// Gộp rating_avg/review_count bằng LEFT JOIN + GROUP BY ngay trong 1 câu query thay vì lặp
// N truy vấn con cho từng venue (N+1), vì danh sách venue luôn hiển thị kèm rating trên list/detail.
export async function listVenues(category, userLat, userLng) {
  const { rows } = await query(
    `SELECT v.*, COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS rating_avg, COUNT(r.id) AS review_count
     FROM partner_venues v
     LEFT JOIN venue_reviews r ON r.venue_id = v.id
     ${category ? 'WHERE v.category = $1' : ''}
     GROUP BY v.id ORDER BY v.name`,
    category ? [category] : [],
  )
  return withDistance(rows.map(toVenueShape), userLat, userLng)
}

export async function listCategories() {
  const { rows } = await query('SELECT DISTINCT category FROM partner_venues ORDER BY category')
  return rows.map((row) => row.category)
}

export async function getVenueById(id, userLat, userLng) {
  const { rows } = await query(
    `SELECT v.*, COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS rating_avg, COUNT(r.id) AS review_count
     FROM partner_venues v
     LEFT JOIN venue_reviews r ON r.venue_id = v.id
     WHERE v.id = $1
     GROUP BY v.id`,
    [id],
  )
  if (!rows[0]) return null
  return withDistance([toVenueShape(rows[0])], userLat, userLng)[0]
}

export async function listVenueReviews(venueId) {
  const { rows } = await query(
    'SELECT id, rating, comment_vi, created_at FROM venue_reviews WHERE venue_id = $1 ORDER BY created_at DESC',
    [venueId],
  )
  return rows.map(toVenueReviewShape)
}

export async function countVenueReviews() {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM venue_reviews')
  return rows[0].count
}

export async function listServicesForVenue(venueId) {
  const { rows } = await query(
    'SELECT * FROM partner_services WHERE venue_id = $1 ORDER BY id', [venueId],
  )
  return rows.map(toServiceShape)
}

export async function getServiceRawById(id) {
  const { rows } = await query('SELECT * FROM partner_services WHERE id = $1', [id])
  return rows[0]
}

function generateInvoiceCode() {
  return `HS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
}

// Đặt dịch vụ tại trung tâm đối tác — DEMO: đặt cọc/thanh toán đi qua payments/provider.js (provider
// 'mock' xác nhận tức thì), invoice_code là mã hoá đơn nội bộ của web, KHÔNG phải hoá đơn điện tử
// hợp lệ theo quy định thuế.
//
// Khoá voucher (FOR UPDATE) và kiểm tra used_at NGAY TRONG transaction đặt chỗ — nếu chỉ kiểm tra
// trước rồi mới UPDATE riêng như trước đây, 2 request đặt chỗ gửi gần như đồng thời cùng 1 voucher
// đều có thể đọc thấy used_at IS NULL trước khi cái kia commit, dẫn đến double-apply cùng 1 voucher
// cho 2 booking khác nhau.
//
// Booking được tạo với status='pending_payment' (đúng default cột) rồi mới xác nhận payment_intent —
// với provider mock thì gần như tức thì nên trải nghiệm không đổi, nhưng khi cắm cổng thật, booking
// sẽ thực sự đứng ở trạng thái chờ cho tới khi có xác nhận, thay vì luôn ghi thẳng 'confirmed'.
export async function bookService(userId, serviceId, { userVoucherId, scheduledAt } = {}) {
  const service = await getServiceRawById(serviceId)
  if (!service) return null

  const invoiceCode = generateInvoiceCode()

  const pendingBooking = await transaction(async (client) => {
    let finalPrice = service.price_vnd
    let appliedUserVoucherId = null

    if (userVoucherId) {
      const { rows } = await client.query(
        `SELECT uv.*, v.discount_type, v.discount_value FROM user_vouchers uv
         JOIN vouchers v ON v.id = uv.voucher_id
         WHERE uv.id = $1 AND uv.user_id = $2 AND uv.used_at IS NULL
         FOR UPDATE OF uv`,
        [userVoucherId, userId],
      )
      const voucher = rows[0]
      if (voucher) {
        finalPrice = computeDiscountedPrice(service.price_vnd, voucher)
        appliedUserVoucherId = voucher.id
      }
    }

    const { rows } = await client.query(
      `INSERT INTO venue_bookings (user_id,service_id,user_voucher_id,scheduled_at,final_price_vnd,status,invoice_code)
       VALUES ($1,$2,$3,$4,$5,'pending_payment',$6) RETURNING *`,
      [userId, serviceId, appliedUserVoucherId, scheduledAt ?? new Date(), finalPrice, invoiceCode],
    )
    return { booking: rows[0], appliedUserVoucherId, finalPrice }
  })

  const intent = await getProvider().createIntent({
    userId,
    purpose: 'venue_deposit',
    referenceId: String(pendingBooking.booking.id),
    amountVnd: pendingBooking.finalPrice,
  })

  if (intent.status !== 'succeeded') {
    // Cổng thật chưa xác nhận — giữ nguyên 'pending_payment', không đánh dấu voucher đã dùng.
    // Webhook/redirect (khi có cổng thật) sẽ gọi lại để hoàn tất bước dưới.
    return toBookingShape(pendingBooking.booking)
  }

  return transaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE venue_bookings SET status = 'confirmed' WHERE id = $1 RETURNING *`,
      [pendingBooking.booking.id],
    )
    if (pendingBooking.appliedUserVoucherId) {
      await client.query('UPDATE user_vouchers SET used_at = NOW() WHERE id = $1', [pendingBooking.appliedUserVoucherId])
    }
    await recordVenueBookingSettlement(pendingBooking.booking.id, pendingBooking.finalPrice, {
      db: client.query.bind(client),
    })
    return { ...toBookingShape(rows[0]), paymentRef: intent.providerRef }
  })
}

export async function listBookingsForUser(userId) {
  const { rows } = await query(
    'SELECT * FROM venue_bookings WHERE user_id = $1 ORDER BY created_at DESC', [userId],
  )
  return rows.map(toBookingShape)
}

export async function getBookingForUser(userId, id) {
  const { rows } = await query(
    'SELECT * FROM venue_bookings WHERE id = $1 AND user_id = $2', [id, userId],
  )
  return rows[0] ? toBookingShape(rows[0]) : null
}
