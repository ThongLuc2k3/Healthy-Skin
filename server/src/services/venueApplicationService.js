import { query } from '../db/connection.js'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

function toShape(row) {
  if (!row) return null
  return {
    id: row.id,
    businessName: row.business_name,
    category: row.category,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    areaVi: row.area_vi,
    addressVi: row.address_vi,
    descriptionVi: row.description_vi,
    status: row.status,
    adminNote: row.admin_note,
    createdVenueId: row.created_venue_id,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
  }
}

const REQUIRED_FIELDS = [
  'businessName', 'category', 'contactName', 'contactPhone', 'contactEmail', 'areaVi', 'addressVi', 'descriptionVi',
]

// Nộp đơn công khai (chủ cửa hàng, không cần đăng nhập) — vào thẳng trạng thái 'pending' để chờ
// quản trị viên duyệt ở trang Admin (xem reviewVenueApplication). Trả null khi thiếu trường bắt
// buộc — route dịch thành lỗi 400 kèm thông báo cụ thể, KHÔNG throw vì errorHandler dùng chung
// err.publicMessage (chưa nơi nào set) nên message thật sẽ không hiện ra cho người dùng.
export async function createVenueApplication(input) {
  const missing = REQUIRED_FIELDS.some((field) => !String(input?.[field] ?? '').trim())
  if (missing) return null

  const { rows } = await query(
    `INSERT INTO venue_applications
      (business_name,category,contact_name,contact_phone,contact_email,area_vi,address_vi,description_vi)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      input.businessName.trim(), input.category.trim(), input.contactName.trim(),
      input.contactPhone.trim(), input.contactEmail.trim(), input.areaVi.trim(),
      input.addressVi.trim(), input.descriptionVi.trim(),
    ],
  )
  return toShape(rows[0])
}

export async function listVenueApplications(status) {
  const { rows } = await query(
    `SELECT * FROM venue_applications ${status ? 'WHERE status = $1' : ''} ORDER BY submitted_at DESC`,
    status ? [status] : [],
  )
  return rows.map(toShape)
}

// Duyệt đơn: tạo luôn 1 dòng partner_venues (chưa có dịch vụ, admin/đối tác bổ sung sau) để việc
// duyệt có tác dụng thật — trung tâm xuất hiện ngay trên trang Dịch Vụ Quanh Bạn thay vì chỉ đổi
// trạng thái đơn. Từ chối chỉ cập nhật trạng thái + ghi chú lý do.
export async function reviewVenueApplication(id, decision, note) {
  const { rows } = await query('SELECT * FROM venue_applications WHERE id = $1', [id])
  const application = rows[0]
  if (!application || application.status !== 'pending') return null

  if (decision === 'approved') {
    const venueId = `venue_${slugify(application.business_name)}_${application.id}`
    await query(
      `INSERT INTO partner_venues (id,name,category,address_vi,area_vi,description_vi,cover_image_url)
       VALUES ($1,$2,$3,$4,$5,$6,NULL)
       ON CONFLICT (id) DO NOTHING`,
      [venueId, application.business_name, application.category, application.address_vi,
        application.area_vi, application.description_vi],
    )
    const { rows: updated } = await query(
      `UPDATE venue_applications
       SET status = 'approved', admin_note = $2, created_venue_id = $3, reviewed_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, note ?? null, venueId],
    )
    return toShape(updated[0])
  }

  const { rows: updated } = await query(
    `UPDATE venue_applications
     SET status = 'rejected', admin_note = $2, reviewed_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, note ?? null],
  )
  return toShape(updated[0])
}
