import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import { initDatabase, transaction, closeDatabase, query } from './connection.js'
import { EXPERT_COMMISSION_RATE, VENUE_COMMISSION_RATE, computeCommission } from '../config/pricing.js'
import { CHAT_PLANS } from '../services/chatWalletService.js'

const SALT_ROUNDS = 10

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendDataDir = join(__dirname, '..', '..', '..', 'src', 'data')
const serverDataDir = join(__dirname, '..', 'data')
const loadJson = (name) => JSON.parse(readFileSync(join(frontendDataDir, name), 'utf8'))
const loadServerJson = (name) => JSON.parse(readFileSync(join(serverDataDir, name), 'utf8'))

export async function seedExperts() {
  const experts = loadServerJson('experts.json')
  await transaction(async (client) => {
    for (const item of experts) {
      await client.query(
        `INSERT INTO experts
          (id,name,specialty,clinic_name,area_vi,bio_vi,certifications,rating_avg,reviews,available_slots,consultation_fee_vnd)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,specialty=EXCLUDED.specialty,
           clinic_name=EXCLUDED.clinic_name,area_vi=EXCLUDED.area_vi,bio_vi=EXCLUDED.bio_vi,
           certifications=EXCLUDED.certifications,rating_avg=EXCLUDED.rating_avg,
           reviews=EXCLUDED.reviews,available_slots=EXCLUDED.available_slots,
           consultation_fee_vnd=EXCLUDED.consultation_fee_vnd`,
        [item.id, item.name, item.specialty, item.clinic_name, item.area_vi, item.bio_vi,
          JSON.stringify(item.certifications ?? []), item.rating_avg ?? 0,
          JSON.stringify(item.reviews ?? []), JSON.stringify(item.available_slots ?? []),
          item.consultation_fee_vnd ?? 0],
      )
    }
  })
  return { expertsCount: experts.length }
}

export async function seedSponsoredContent() {
  const products = loadServerJson('sponsored_products.json')
  const ads = loadServerJson('homepage_ads.json')
  await transaction(async (client) => {
    for (const item of products) {
      // placements KHÔNG nằm trong DO UPDATE SET — đó là giá trị khởi tạo ban đầu, sau đó quản trị
      // viên chỉnh qua trang Admin (adminService.updateSponsoredPlacement). Nếu ghi đè ở đây mỗi lần
      // seed lại (server khởi động lại) thì thao tác bật/tắt vị trí của admin sẽ bị mất tác dụng.
      await client.query(
        `INSERT INTO sponsored_products (id,name,brand,matched_item_id,price_vnd,affiliate_url,sponsor_name,placements)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,brand=EXCLUDED.brand,
           matched_item_id=EXCLUDED.matched_item_id,price_vnd=EXCLUDED.price_vnd,
           affiliate_url=EXCLUDED.affiliate_url,sponsor_name=EXCLUDED.sponsor_name`,
        [item.id, item.name, item.brand ?? null, item.matched_item_id ?? null,
          item.price_vnd ?? null, item.affiliate_url, item.sponsor_name,
          JSON.stringify(item.placements ?? [])],
      )
    }
    // homepage_ads không có khoá tự nhiên để ON CONFLICT, và không bảng nào tham chiếu tới id của
    // nó — xoá sạch rồi chèn lại từ data/homepage_ads.json là cách đơn giản nhất để tránh nhân đôi
    // quảng cáo mỗi lần server khởi động lại.
    await client.query('DELETE FROM homepage_ads')
    for (const ad of ads) {
      await client.query(
        `INSERT INTO homepage_ads (sponsor_name,image_url,link_url,priority) VALUES ($1,$2,$3,$4)`,
        [ad.sponsor_name, ad.image_url, ad.link_url, ad.priority ?? 0],
      )
    }
  })
  return { productsCount: products.length, adsCount: ads.length }
}

export async function seedVenuesAndVouchers() {
  const venues = loadServerJson('partner_venues.json')
  const vouchers = loadServerJson('vouchers.json')
  let servicesCount = 0

  await transaction(async (client) => {
    for (const venue of venues) {
      await client.query(
        `INSERT INTO partner_venues (id,name,category,address_vi,area_vi,description_vi,cover_image_url,latitude,longitude)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,category=EXCLUDED.category,
           address_vi=EXCLUDED.address_vi,area_vi=EXCLUDED.area_vi,
           description_vi=EXCLUDED.description_vi,cover_image_url=EXCLUDED.cover_image_url,
           latitude=EXCLUDED.latitude,longitude=EXCLUDED.longitude`,
        [venue.id, venue.name, venue.category, venue.address_vi, venue.area_vi,
          venue.description_vi, venue.cover_image_url ?? null,
          venue.latitude ?? null, venue.longitude ?? null],
      )

      const { rows: existing } = await client.query(
        'SELECT id FROM partner_services WHERE venue_id = $1', [venue.id],
      )
      if (existing.length === 0) {
        for (const service of venue.services ?? []) {
          await client.query(
            `INSERT INTO partner_services (venue_id,name_vi,price_vnd,duration_minutes)
             VALUES ($1,$2,$3,$4)`,
            [venue.id, service.name_vi, service.price_vnd, service.duration_minutes ?? null],
          )
          servicesCount += 1
        }
      }
    }

    for (const v of vouchers) {
      await client.query(
        `INSERT INTO vouchers (id,title_vi,discount_type,discount_value,venue_id,points_cost,source)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(id) DO UPDATE SET title_vi=EXCLUDED.title_vi,discount_type=EXCLUDED.discount_type,
           discount_value=EXCLUDED.discount_value,venue_id=EXCLUDED.venue_id,
           points_cost=EXCLUDED.points_cost,source=EXCLUDED.source`,
        [v.id, v.title_vi, v.discount_type, v.discount_value, v.venue_id ?? null,
          v.points_cost ?? 0, v.source ?? 'points'],
      )
    }
  })

  return { venuesCount: venues.length, servicesCount, vouchersCount: vouchers.length }
}

// Đánh giá "Dịch Vụ Quanh Bạn" cần user_id thật (venue_reviews.user_id NOT NULL REFERENCES users),
// nên trước khi insert review phải upsert sẵn các tài khoản người đánh giá mẫu (demo, mật khẩu seed
// dùng chung, không phải tài khoản thật). Gate trên COUNT(*) của bảng để chạy lại server không tạo
// review trùng lặp mỗi lần khởi động.
export async function seedVenueReviews() {
  const { rows: countRows } = await query('SELECT COUNT(*)::int AS count FROM venue_reviews')
  if (countRows[0].count > 0) return { reviewsCount: 0 }

  const reviews = loadServerJson('venue_reviews.json')
  const reviewerEmails = [...new Set(reviews.map((r) => r.user_email))]
  const passwordHash = await bcrypt.hash('seeded-reviewer-account', SALT_ROUNDS)

  await transaction(async (client) => {
    const userIdByEmail = new Map()
    for (const email of reviewerEmails) {
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash) VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [email, passwordHash],
      )
      userIdByEmail.set(email, rows[0].id)
    }

    for (const review of reviews) {
      await client.query(
        `INSERT INTO venue_reviews (venue_id, user_id, rating, comment_vi, created_at)
         VALUES ($1, $2, $3, $4, NOW() - $5::interval)`,
        [review.venue_id, userIdByEmail.get(review.user_email), review.rating, review.comment_vi,
          `${review.days_ago} days`],
      )
    }
  })

  return { reviewsCount: reviews.length }
}

const MIN_VOUCHERS_PER_USER = 10
const OBTAINED_VIA_CYCLE = ['points_redeem', 'game_reward', 'package_bonus', 'welcome_gift']

// Đảm bảo MỌI thành viên (seed lẫn đăng ký thật) có ít nhất MIN_VOUCHERS_PER_USER voucher trong Kho
// Voucher — kiểm tra TỪNG user (không phải 1 cờ toàn cục) nên chạy lại mỗi lần server khởi động vẫn
// tự "vá" cho user mới đăng ký sau này thay vì chỉ áp dụng đúng 1 lần lúc seed ban đầu.
export async function seedUserVouchers() {
  const { rows: catalog } = await query('SELECT id FROM vouchers ORDER BY id')
  if (catalog.length === 0) return { grantedCount: 0 }

  const { rows: users } = await query('SELECT id FROM users ORDER BY id')
  let grantedCount = 0

  await transaction(async (client) => {
    for (const user of users) {
      const { rows: countRows } = await client.query(
        'SELECT COUNT(*)::int AS count FROM user_vouchers WHERE user_id = $1', [user.id],
      )
      let have = countRows[0].count
      let cursor = have
      while (have < MIN_VOUCHERS_PER_USER) {
        const voucher = catalog[cursor % catalog.length]
        const obtainedVia = OBTAINED_VIA_CYCLE[cursor % OBTAINED_VIA_CYCLE.length]
        const daysAgo = (cursor % 30) + 1
        // Cứ 3 voucher thì có 1 cái đã dùng — để "Kho Voucher" trông như tài khoản có hoạt động
        // thật, không phải toàn bộ đều mới tinh chưa đụng tới.
        const markUsed = cursor % 3 === 0
        const usedAt = markUsed ? new Date(Date.now() - (daysAgo - 1) * 86400000) : null
        await client.query(
          `INSERT INTO user_vouchers (user_id, voucher_id, obtained_via, obtained_at, used_at)
           VALUES ($1,$2,$3, NOW() - $4::interval, $5)`,
          [user.id, voucher.id, obtainedVia, `${daysAgo} days`, usedAt],
        )
        cursor += 1
        have += 1
        grantedCount += 1
      }
    }
  })

  return { grantedCount }
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

// Đơn đăng ký đối tác mẫu — chỉ chèn khi bảng còn trống (không dùng ON CONFLICT vì id tự tăng),
// để không nhân đôi mỗi lần server khởi động lại như các seed khác dùng khoá tự nhiên.
export async function seedVenueApplications() {
  const { rows: existing } = await query('SELECT COUNT(*)::int AS count FROM venue_applications')
  if (existing[0].count > 0) return { applicationsCount: 0 }

  const applications = loadServerJson('venue_applications.json')
  let applicationsCount = 0

  await transaction(async (client) => {
    for (const item of applications) {
      const { rows } = await client.query(
        `INSERT INTO venue_applications
          (business_name,category,contact_name,contact_phone,contact_email,area_vi,address_vi,
           description_vi,status,admin_note,submitted_at,reviewed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
           NOW() - $11::interval,
           $12)
         RETURNING id`,
        [item.business_name, item.category, item.contact_name, item.contact_phone, item.contact_email,
          item.area_vi, item.address_vi, item.description_vi, item.status, item.admin_note ?? null,
          `${item.days_ago_submitted ?? 0} days`,
          item.days_ago_reviewed != null ? new Date(Date.now() - item.days_ago_reviewed * 86400000) : null],
      )
      applicationsCount += 1

      if (item.status === 'approved') {
        const venueId = `venue_${slugify(item.business_name)}_${rows[0].id}`
        await client.query(
          `INSERT INTO partner_venues (id,name,category,address_vi,area_vi,description_vi,cover_image_url)
           VALUES ($1,$2,$3,$4,$5,$6,NULL)
           ON CONFLICT (id) DO NOTHING`,
          [venueId, item.business_name, item.category, item.address_vi, item.area_vi, item.description_vi],
        )
        await client.query('UPDATE venue_applications SET created_venue_id = $2 WHERE id = $1', [rows[0].id, venueId])
      }
    }
  })

  return { applicationsCount }
}

// Đơn ứng tuyển chuyên gia mẫu — cùng quy tắc idempotent với seedVenueApplications (chỉ chèn khi
// bảng còn trống). Đơn đã 'approved' cũng tạo thẳng dòng experts tương ứng để lịch sử nhất quán.
export async function seedExpertApplications() {
  const { rows: existing } = await query('SELECT COUNT(*)::int AS count FROM expert_applications')
  if (existing[0].count > 0) return { applicationsCount: 0 }

  const applications = loadServerJson('expert_applications.json')
  let applicationsCount = 0

  await transaction(async (client) => {
    for (const item of applications) {
      const { rows } = await client.query(
        `INSERT INTO expert_applications
          (full_name,specialty,clinic_name,area_vi,bio_vi,contact_phone,contact_email,
           proposed_fee_vnd,proposed_slots,status,admin_note,submitted_at,reviewed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
           NOW() - $12::interval,
           $13)
         RETURNING id`,
        [item.full_name, item.specialty, item.clinic_name, item.area_vi, item.bio_vi,
          item.contact_phone, item.contact_email, item.proposed_fee_vnd,
          JSON.stringify(item.proposed_slots ?? []), item.status, item.admin_note ?? null,
          `${item.days_ago_submitted ?? 0} days`,
          item.days_ago_reviewed != null ? new Date(Date.now() - item.days_ago_reviewed * 86400000) : null],
      )
      applicationsCount += 1

      if (item.status === 'approved') {
        const baseId = `bs_${slugify(item.full_name)}`
        let expertId = baseId
        let suffix = 1
        while ((await client.query('SELECT 1 FROM experts WHERE id = $1', [expertId])).rows.length > 0) {
          suffix += 1
          expertId = `${baseId}_${suffix}`
        }
        await client.query(
          `INSERT INTO experts (id,name,specialty,clinic_name,area_vi,bio_vi,certifications,rating_avg,reviews,available_slots,consultation_fee_vnd)
           VALUES ($1,$2,$3,$4,$5,$6,'[]',0,'[]',$7,$8)
           ON CONFLICT (id) DO NOTHING`,
          [expertId, item.full_name, item.specialty, item.clinic_name, item.area_vi, item.bio_vi,
            JSON.stringify(item.proposed_slots ?? []), item.proposed_fee_vnd],
        )
        await client.query('UPDATE expert_applications SET created_expert_id = $2 WHERE id = $1', [rows[0].id, expertId])
      }
    }
  })

  return { applicationsCount }
}

export async function seedWebsiteReviews() {
  const reviews = loadServerJson('website_reviews.json')
  let reviewsCount = 0

  await transaction(async (client) => {
    const passwordHash = await bcrypt.hash('seeded-reviewer-account', SALT_ROUNDS)
    for (const item of reviews) {
      // COALESCE giữ nguyên nếu người dùng đã tự sửa thông tin thật ở trang Tài khoản của tôi.
      const { rows: userRows } = await client.query(
        `INSERT INTO users (email, password_hash, full_name, phone, date_of_birth)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (email) DO UPDATE SET
           full_name = COALESCE(users.full_name, EXCLUDED.full_name),
           phone = COALESCE(users.phone, EXCLUDED.phone),
           date_of_birth = COALESCE(users.date_of_birth, EXCLUDED.date_of_birth)
         RETURNING id`,
        [item.email, passwordHash, item.author_name ?? null, item.phone ?? null, item.date_of_birth ?? null],
      )
      const userId = userRows[0].id

      const { rows: existing } = await client.query(
        'SELECT id FROM website_reviews WHERE user_id = $1 AND title = $2', [userId, item.title],
      )
      if (existing.length === 0) {
        await client.query(
          `INSERT INTO website_reviews (user_id, rating, title, content, author_name, created_at)
           VALUES ($1,$2,$3,$4,$5, NOW() - $6::interval)`,
          [userId, item.rating, item.title, item.content, item.author_name, `${item.days_ago ?? 0} days`],
        )
        reviewsCount += 1
      }
    }
  })

  return { reviewsCount }
}

function generateHistoricalPaymentRef() {
  return `HSPAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

// Lịch sử hoạt động mẫu (nạp ví/mua gói/đặt lịch chuyên gia/đặt dịch vụ) — không có thì trang Admin
// (Tổng quan, Thành viên) và trang Gói Trợ Lý của người dùng đều trống trơn/toàn số 0 ở lần chạy đầu
// tiên. Đi qua đúng các bảng payment_intents/expert_bookings/venue_bookings/settlement_records mà
// luồng thật dùng (không mock riêng 1 kiểu dữ liệu khác), để Admin xem là dữ liệu nhất quán với các
// review đã seed (vd: Hoàng Phạm review khen BS. Nguyễn Văn A thì ở đây cũng có đúng booking đó).
// Chỉ chạy 1 lần — nếu người dùng đã tự tạo giao dịch/lịch hẹn thật thì bỏ qua để không chèn đè.
export async function seedHistoricalActivity() {
  const [{ rows: piCount }, { rows: ebCount }, { rows: vbCount }] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM payment_intents'),
    query('SELECT COUNT(*)::int AS count FROM expert_bookings'),
    query('SELECT COUNT(*)::int AS count FROM venue_bookings'),
  ])
  if (piCount[0].count > 0 || ebCount[0].count > 0 || vbCount[0].count > 0) {
    return { seeded: false }
  }

  const data = loadServerJson('historical_activity.json')
  const passwordHash = await bcrypt.hash('seeded-member-account', SALT_ROUNDS)

  await transaction(async (client) => {
    // profile = { fullName, phone, dateOfBirth } tuỳ chọn — dùng COALESCE để KHÔNG ghi đè nếu người
    // dùng đã tự sửa thông tin thật ở trang Tài khoản của tôi sau khi tài khoản này được seed.
    async function userIdFor(email, profile = {}) {
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, full_name, phone, date_of_birth)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (email) DO UPDATE SET
           full_name = COALESCE(users.full_name, EXCLUDED.full_name),
           phone = COALESCE(users.phone, EXCLUDED.phone),
           date_of_birth = COALESCE(users.date_of_birth, EXCLUDED.date_of_birth)
         RETURNING id`,
        [email, passwordHash, profile.fullName ?? null, profile.phone ?? null, profile.dateOfBirth ?? null],
      )
      return rows[0].id
    }

    async function ensureWallet(userId) {
      await client.query(
        `INSERT INTO user_wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [userId],
      )
    }

    for (const m of data.additionalMembers ?? []) {
      await userIdFor(m.email, m)
    }

    for (const t of data.walletTopups ?? []) {
      const userId = await userIdFor(t.email)
      await ensureWallet(userId)
      const interval = `${t.daysAgo ?? 0} days`
      await client.query(
        `INSERT INTO payment_intents (user_id,purpose,reference_id,amount_vnd,provider,status,provider_ref,created_at,completed_at)
         VALUES ($1,'wallet_topup',NULL,$2,'mock','succeeded',$3, NOW() - $4::interval, NOW() - $4::interval)`,
        [userId, t.amountVnd, generateHistoricalPaymentRef(), interval],
      )
      const points = Math.floor(t.amountVnd * 0.1)
      await client.query(
        `UPDATE user_wallets SET balance_vnd = balance_vnd + $2, loyalty_points = loyalty_points + $3 WHERE user_id = $1`,
        [userId, t.amountVnd, points],
      )
    }

    for (const p of data.planPurchases ?? []) {
      const plan = CHAT_PLANS.find((cp) => cp.id === p.planId)
      if (!plan) continue
      const userId = await userIdFor(p.email)
      await ensureWallet(userId)
      const interval = `${p.daysAgo ?? 0} days`
      await client.query(
        `INSERT INTO payment_intents (user_id,purpose,reference_id,amount_vnd,provider,status,provider_ref,created_at,completed_at)
         VALUES ($1,'plan_purchase',$2,$3,'mock','succeeded',$4, NOW() - $5::interval, NOW() - $5::interval)`,
        [userId, plan.id, plan.priceVnd, generateHistoricalPaymentRef(), interval],
      )
      await client.query(
        `UPDATE user_wallets SET plan_id = $2, purchased_questions_remaining = purchased_questions_remaining + $3 WHERE user_id = $1`,
        [userId, plan.id, plan.questionQuota],
      )
    }

    for (const b of data.expertBookings ?? []) {
      const userId = await userIdFor(b.email)
      const { rows: expertRows } = await client.query(
        'SELECT consultation_fee_vnd FROM experts WHERE id = $1', [b.expertId],
      )
      const feeVnd = expertRows[0]?.consultation_fee_vnd ?? 0
      const interval = `${b.daysAgo ?? 0} days`
      const { rows: bookingRows } = await client.query(
        `INSERT INTO expert_bookings (user_id,expert_id,slot,status,consultation_fee_vnd,created_at)
         VALUES ($1,$2,$3,$4,$5, NOW() - $6::interval) RETURNING id`,
        [userId, b.expertId, b.slot, b.status ?? 'completed', feeVnd, interval],
      )
      if (feeVnd > 0) {
        const commission = computeCommission(feeVnd, EXPERT_COMMISSION_RATE)
        await client.query(
          'UPDATE expert_bookings SET platform_commission_vnd = $2 WHERE id = $1',
          [bookingRows[0].id, commission],
        )
        await client.query(
          `INSERT INTO settlement_records (booking_type,booking_id,gross_amount_vnd,commission_vnd,payout_vnd,status,created_at,settled_at)
           VALUES ('expert',$1,$2,$3,$4,'settled', NOW() - $5::interval, NOW() - $5::interval)`,
          [bookingRows[0].id, feeVnd, commission, feeVnd - commission, interval],
        )
      }
    }

    for (const v of data.venueBookings ?? []) {
      const userId = await userIdFor(v.email)
      const { rows: serviceRows } = await client.query(
        'SELECT id, price_vnd FROM partner_services WHERE venue_id = $1 AND name_vi = $2 LIMIT 1',
        [v.venueId, v.serviceNameVi],
      )
      const service = serviceRows[0]
      if (!service) continue
      const interval = `${v.daysAgo ?? 0} days`
      const invoiceCode = `HS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
      const { rows: bookingRows } = await client.query(
        `INSERT INTO venue_bookings (user_id,service_id,scheduled_at,final_price_vnd,status,invoice_code,created_at)
         VALUES ($1,$2, NOW() - $3::interval, $4,'confirmed',$5, NOW() - $3::interval) RETURNING id`,
        [userId, service.id, interval, service.price_vnd, invoiceCode],
      )
      const commission = computeCommission(service.price_vnd, VENUE_COMMISSION_RATE)
      const payout = service.price_vnd - commission
      await client.query(
        'UPDATE venue_bookings SET platform_commission_vnd = $2, partner_payout_vnd = $3 WHERE id = $1',
        [bookingRows[0].id, commission, payout],
      )
      await client.query(
        `INSERT INTO settlement_records (booking_type,booking_id,gross_amount_vnd,commission_vnd,payout_vnd,status,created_at,settled_at)
         VALUES ('venue',$1,$2,$3,$4,'settled', NOW() - $5::interval, NOW() - $5::interval)`,
        [bookingRows[0].id, service.price_vnd, commission, payout, interval],
      )
    }
  })

  return { seeded: true }
}

export async function seed() {
  const skincare = loadJson('skincare_ingredients.json')
  const food = loadJson('food_items.json')
  await transaction(async (client) => {
    for (const item of skincare) {
      await client.query(
        `INSERT INTO skincare_ingredients
          (id,name_vi,category,flags,conflicts_with_skin_type,explanation_vi,source)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(id) DO UPDATE SET name_vi=EXCLUDED.name_vi,category=EXCLUDED.category,
           flags=EXCLUDED.flags,conflicts_with_skin_type=EXCLUDED.conflicts_with_skin_type,
           explanation_vi=EXCLUDED.explanation_vi,source=EXCLUDED.source`,
        [item.id, item.name_vi, item.category, JSON.stringify(item.flags ?? []),
          JSON.stringify(item.conflicts_with_skin_type ?? []), item.explanation_vi, item.source ?? null],
      )
    }
    for (const item of food) {
      await client.query(
        `INSERT INTO food_items
          (id,name_vi,category,flags,conflicts_with_allergy,conflicts_with_condition,explanation_vi,source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT(id) DO UPDATE SET name_vi=EXCLUDED.name_vi,category=EXCLUDED.category,
           flags=EXCLUDED.flags,conflicts_with_allergy=EXCLUDED.conflicts_with_allergy,
           conflicts_with_condition=EXCLUDED.conflicts_with_condition,
           explanation_vi=EXCLUDED.explanation_vi,source=EXCLUDED.source`,
        [item.id, item.name_vi, item.category, JSON.stringify(item.flags ?? []),
          JSON.stringify(item.conflicts_with_allergy ?? []),
          JSON.stringify(item.conflicts_with_condition ?? []), item.explanation_vi, item.source ?? null],
      )
    }
  })
  return { skincareCount: skincare.length, foodCount: food.length }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await initDatabase()
    const counts = await seed()
    const expertCounts = await seedExperts()
    console.log(`Seed hoàn tất: ${counts.skincareCount} skincare, ${counts.foodCount} food, ${expertCounts.expertsCount} chuyên gia.`)
  } finally {
    await closeDatabase()
  }
}
