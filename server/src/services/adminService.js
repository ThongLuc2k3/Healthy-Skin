import { query, transaction } from '../db/connection.js'
import { getSettlementSummary } from './settlementService.js'
import { listTransactionsForUser } from './paymentIntentService.js'

function parsed(value) {
  return typeof value === 'string' ? JSON.parse(value) : value
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

// grossTotalVnd/commissionTotalVnd (từ settlement_records) CHỈ tính hoa hồng lịch hẹn chuyên gia/dịch
// vụ đối tác — nạp ví và mua gói đi qua payment_intents, MỘT bảng hoàn toàn khác, trước đây không hề
// được cộng vào đây nên "doanh thu" admin thấy luôn thiếu phần nạp tiền/mua gói dù người dùng nạp rất
// nhiều (bug đã báo). Cộng thêm tổng payment_intents theo purpose, chỉ tính bản ghi status='succeeded'.
export async function getOverviewStats() {
  const [members, experts, venues, pendingApps, expertBookings, venueBookings, settlement, paymentTotals] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM users'),
    query('SELECT COUNT(*)::int AS count FROM experts'),
    query('SELECT COUNT(*)::int AS count FROM partner_venues'),
    query(`SELECT COUNT(*)::int AS count FROM venue_applications WHERE status = 'pending'`),
    query('SELECT COUNT(*)::int AS count FROM expert_bookings'),
    query('SELECT COUNT(*)::int AS count FROM venue_bookings'),
    getSettlementSummary(),
    query(
      `SELECT purpose, COALESCE(SUM(amount_vnd), 0)::int AS total_vnd, COUNT(*)::int AS count
       FROM payment_intents WHERE status = 'succeeded' GROUP BY purpose`,
    ),
  ])

  const grossTotalVnd = settlement.reduce((sum, row) => sum + row.gross_total_vnd, 0)
  const commissionTotalVnd = settlement.reduce((sum, row) => sum + row.commission_total_vnd, 0)

  const byPurpose = Object.fromEntries(paymentTotals.rows.map((r) => [r.purpose, { totalVnd: r.total_vnd, count: r.count }]))
  const walletTopupVnd = byPurpose.wallet_topup?.totalVnd || 0
  const planPurchaseVnd = byPurpose.plan_purchase?.totalVnd || 0
  const venueDepositVnd = byPurpose.venue_deposit?.totalVnd || 0

  return {
    memberCount: members.rows[0].count,
    expertCount: experts.rows[0].count,
    venueCount: venues.rows[0].count,
    pendingVenueApplications: pendingApps.rows[0].count,
    expertBookingCount: expertBookings.rows[0].count,
    venueBookingCount: venueBookings.rows[0].count,
    grossTotalVnd,
    commissionTotalVnd,
    settlementByType: settlement,
    walletTopupVnd,
    planPurchaseVnd,
    venueDepositVnd,
    paymentRevenueTotalVnd: walletTopupVnd + planPurchaseVnd + venueDepositVnd,
    paymentByPurpose: byPurpose,
  }
}

export async function listMembers({ limit = 100 } = {}) {
  const { rows } = await query(
    `SELECT
       u.id, u.email, u.full_name, u.phone, u.created_at, u.date_of_birth, u.address_vi, u.social_link,
       u.bank_name, u.bank_account_masked, u.bank_linked_at, u.is_locked, u.locked_reason, u.locked_at,
       COALESCE(w.plan_id, 'free') AS plan_id,
       COALESCE(w.balance_vnd, 0) AS balance_vnd,
       COALESCE(w.loyalty_points, 0) AS loyalty_points,
       (SELECT COUNT(*)::int FROM expert_bookings eb WHERE eb.user_id = u.id) AS expert_booking_count,
       (SELECT COUNT(*)::int FROM venue_bookings vb WHERE vb.user_id = u.id) AS venue_booking_count,
       (SELECT COUNT(*)::int FROM website_reviews r WHERE r.user_id = u.id) AS review_count
     FROM users u
     LEFT JOIN user_wallets w ON w.user_id = u.id
     ORDER BY u.created_at DESC
     LIMIT $1`,
    [limit],
  )
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name || '',
    phone: row.phone || '',
    createdAt: row.created_at,
    dateOfBirth: row.date_of_birth,
    addressVi: row.address_vi || '',
    socialLink: row.social_link || '',
    bankName: row.bank_name || '',
    bankAccountMasked: row.bank_account_masked || '',
    bankLinkedAt: row.bank_linked_at,
    isLocked: row.is_locked,
    lockedReason: row.locked_reason || '',
    lockedAt: row.locked_at,
    planId: row.plan_id,
    balanceVnd: row.balance_vnd,
    loyaltyPoints: row.loyalty_points,
    expertBookingCount: row.expert_booking_count,
    venueBookingCount: row.venue_booking_count,
    reviewCount: row.review_count,
  }))
}

// Khoá/mở khoá tài khoản từ Cổng Quản Trị — dùng khi nghi ngờ rửa tiền/gian lận/vi phạm. Enforce ở
// auth.routes.js (chặn đăng nhập mới + kick phiên đang mở), xem ghi chú ở schema.sql cột is_locked.
export async function setMemberLock(userId, locked, reason) {
  const { rows } = await query(
    `UPDATE users SET is_locked = $2, locked_reason = $3, locked_at = CASE WHEN $2 THEN NOW() ELSE NULL END
     WHERE id = $1
     RETURNING id, is_locked, locked_reason, locked_at`,
    [userId, locked, locked ? (reason || null) : null],
  )
  if (!rows[0]) return null
  return {
    id: rows[0].id,
    isLocked: rows[0].is_locked,
    lockedReason: rows[0].locked_reason || '',
    lockedAt: rows[0].locked_at,
  }
}

const ACTIVITY_TYPES = new Set([
  'deposit', 'plan_purchase', 'venue_deposit', 'expert_booking', 'venue_booking',
  'review_post', 'motivation_post', 'expert_chat',
])

// Nhật ký hoạt động trang web — CHỈ các thao tác quan trọng (nạp tiền, mua gói, đặt lịch/dịch vụ,
// đăng bài, mở tư vấn chuyên gia...), KHÔNG log việc chuyển tab/điều hướng vặt. Gộp bằng UNION ALL
// đọc trực tiếp từ các bảng nghiệp vụ đã có sẵn thay vì 1 bảng audit_log ghi riêng — mọi thao tác ở
// trên vốn đã có dòng + created_at trong DB, tránh rủi ro quên gọi log ở 1 nhánh code nào đó.
export async function listActivity({ type, q, limit = 50, offset = 0 } = {}) {
  const cleanType = ACTIVITY_TYPES.has(type) ? type : null
  const cleanQ = typeof q === 'string' && q.trim() ? q.trim().slice(0, 100) : null

  const { rows } = await query(
    `WITH activity AS (
       SELECT 'deposit' AS type, p.id::text AS source_id, p.user_id, p.amount_vnd,
              'Nạp ví' AS description, p.created_at
       FROM payment_intents p WHERE p.purpose = 'wallet_topup' AND p.status = 'succeeded'
       UNION ALL
       SELECT 'plan_purchase', p.id::text, p.user_id, p.amount_vnd,
              'Mua gói dịch vụ' || COALESCE(' (' || p.reference_id || ')', ''), p.created_at
       FROM payment_intents p WHERE p.purpose = 'plan_purchase' AND p.status = 'succeeded'
       UNION ALL
       SELECT 'venue_deposit', p.id::text, p.user_id, p.amount_vnd,
              'Đặt cọc dịch vụ đối tác', p.created_at
       FROM payment_intents p WHERE p.purpose = 'venue_deposit' AND p.status = 'succeeded'
       UNION ALL
       SELECT 'expert_booking', eb.id::text, eb.user_id, NULL::integer,
              'Đặt lịch chuyên gia (' || eb.status || ')', eb.created_at
       FROM expert_bookings eb
       UNION ALL
       SELECT 'venue_booking', vb.id::text, vb.user_id, vb.final_price_vnd,
              'Đặt dịch vụ đối tác (' || vb.status || ')', vb.created_at
       FROM venue_bookings vb
       UNION ALL
       SELECT 'review_post', r.id::text, r.user_id, NULL::integer,
              'Đăng đánh giá: ' || r.title, r.created_at
       FROM website_reviews r
       UNION ALL
       SELECT 'motivation_post', mp.id::text, mp.user_id, NULL::integer,
              'Đăng bài truyền động lực: ' || mp.title, mp.created_at
       FROM motivation_posts mp
       UNION ALL
       SELECT 'expert_chat', ct.id::text, eb.user_id, NULL::integer,
              'Mở tư vấn chuyên gia', ct.created_at
       FROM consultation_threads ct JOIN expert_bookings eb ON eb.id = ct.booking_id
     )
     SELECT a.*, u.full_name, u.email, COUNT(*) OVER()::int AS total_count
     FROM activity a
     JOIN users u ON u.id = a.user_id
     WHERE ($1::text IS NULL OR a.type = $1)
       AND ($2::text IS NULL OR u.full_name ILIKE '%' || $2 || '%' OR u.email ILIKE '%' || $2 || '%')
     ORDER BY a.created_at DESC
     LIMIT $3 OFFSET $4`,
    [cleanType, cleanQ, limit, offset],
  )

  return {
    total: rows[0]?.total_count || 0,
    items: rows.map((r) => ({
      type: r.type,
      id: `${r.type}-${r.source_id}`,
      userId: r.user_id,
      userName: r.full_name || r.email,
      userEmail: r.email,
      amountVnd: r.amount_vnd,
      description: r.description,
      createdAt: r.created_at,
    })),
  }
}

export async function listExpertsAdmin() {
  const { rows } = await query(
    `SELECT
       e.*,
       (SELECT COUNT(*)::int FROM expert_bookings eb WHERE eb.expert_id = e.id) AS booking_count
     FROM experts e
     ORDER BY e.rating_avg DESC`,
  )
  return rows.map((row) => {
    const certifications = parsed(row.certifications) ?? []
    return {
      id: row.id,
      name: row.name,
      specialty: row.specialty,
      clinicName: row.clinic_name,
      areaVi: row.area_vi,
      bioVi: row.bio_vi,
      ratingAvg: row.rating_avg,
      reviewCount: (parsed(row.reviews) ?? []).length,
      bookingCount: row.booking_count,
      consultationFeeVnd: row.consultation_fee_vnd,
      availableSlots: parsed(row.available_slots) ?? [],
      certifications,
      certificationCount: certifications.length,
      unverifiedCertificationCount: certifications.filter((c) => !c.verified).length,
    }
  })
}

// id ổn định kiểu bs_<tên_không_dấu>, thêm số đếm nếu trùng — chuyên gia thêm qua Admin không có
// đánh giá/mức phí niêm yết sẵn nên khởi tạo rating_avg=0, reviews=[] giống 1 hồ sơ vừa tạo thật.
export async function createExpert(input) {
  const baseId = `bs_${slugify(input.name)}`
  let id = baseId
  let suffix = 1
  while ((await query('SELECT 1 FROM experts WHERE id = $1', [id])).rows.length > 0) {
    suffix += 1
    id = `${baseId}_${suffix}`
  }

  await query(
    `INSERT INTO experts
      (id,name,specialty,clinic_name,area_vi,bio_vi,certifications,rating_avg,reviews,available_slots,consultation_fee_vnd)
     VALUES ($1,$2,$3,$4,$5,$6,'[]',0,'[]',$7,$8)`,
    [id, input.name, input.specialty, input.clinicName, input.areaVi, input.bioVi,
      JSON.stringify(input.availableSlots ?? []), input.consultationFeeVnd ?? 0],
  )
  return id
}

export async function updateExpert(id, input) {
  const { rows } = await query(
    `UPDATE experts SET
       name = $2, specialty = $3, clinic_name = $4, area_vi = $5, bio_vi = $6,
       available_slots = $7, consultation_fee_vnd = $8
     WHERE id = $1 RETURNING id`,
    [id, input.name, input.specialty, input.clinicName, input.areaVi, input.bioVi,
      JSON.stringify(input.availableSlots ?? []), input.consultationFeeVnd ?? 0],
  )
  return rows[0] ?? null
}

export async function updateExpertCertifications(id, certifications) {
  const { rows } = await query(
    `UPDATE experts SET certifications = $2 WHERE id = $1 RETURNING id`,
    [id, JSON.stringify(certifications ?? [])],
  )
  return rows[0] ?? null
}

// Mọi chuyên gia đều có sẵn 1 dòng expert_accounts (đăng nhập demo, xem seedExpertAccounts) — xoá
// dòng đó trước trong CÙNG transaction, nếu không thì experts luôn vướng lỗi khoá ngoại dù chuyên
// gia đó chưa hề có lịch hẹn nào. expert_bookings.expert_id vẫn không có ON DELETE CASCADE (cố ý,
// không tự xoá lịch sử booking của người dùng), nên 23503 ở bước xoá experts nghĩa là đã có lịch hẹn.
export async function deleteExpert(id) {
  try {
    return await transaction(async (client) => {
      await client.query('DELETE FROM expert_accounts WHERE expert_id = $1', [id])
      const { rows } = await client.query('DELETE FROM experts WHERE id = $1 RETURNING id', [id])
      return { deleted: rows.length > 0 }
    })
  } catch (error) {
    if (error.code === '23503') {
      return { deleted: false, reason: 'has_bookings' }
    }
    throw error
  }
}

export const listMemberTransactions = listTransactionsForUser

export async function listSponsoredPlacementsAdmin() {
  const { rows } = await query('SELECT * FROM sponsored_products ORDER BY id')
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sponsorName: row.sponsor_name,
    active: row.active,
    placements: parsed(row.placements) ?? [],
  }))
}

export async function updateSponsoredPlacement(id, placements) {
  const { rows } = await query(
    `UPDATE sponsored_products SET placements = $2 WHERE id = $1 RETURNING id, placements`,
    [id, JSON.stringify(placements ?? [])],
  )
  return rows[0]
}
