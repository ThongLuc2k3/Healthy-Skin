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
    fullName: row.full_name,
    specialty: row.specialty,
    clinicName: row.clinic_name,
    areaVi: row.area_vi,
    bioVi: row.bio_vi,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    proposedFeeVnd: row.proposed_fee_vnd,
    proposedSlots: typeof row.proposed_slots === 'string' ? JSON.parse(row.proposed_slots) : row.proposed_slots,
    status: row.status,
    adminNote: row.admin_note,
    createdExpertId: row.created_expert_id,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
  }
}

const REQUIRED_FIELDS = [
  'fullName', 'specialty', 'clinicName', 'areaVi', 'bioVi', 'contactPhone', 'contactEmail',
]

// Nộp đơn công khai (bác sĩ/chuyên gia tự ứng tuyển, không cần đăng nhập) — tự đề xuất mức phí và
// khung giờ rảnh của mình, vào thẳng 'pending' chờ Admin duyệt (xem reviewExpertApplication). Trả
// null khi thiếu trường bắt buộc hoặc phí đề xuất không hợp lệ — route dịch thành lỗi 400 kèm thông
// báo cụ thể, KHÔNG throw (xem lý do tương tự trong venueApplicationService.js).
export async function createExpertApplication(input) {
  const missing = REQUIRED_FIELDS.some((field) => !String(input?.[field] ?? '').trim())
  const fee = Number(input?.proposedFeeVnd)
  if (missing || !Number.isFinite(fee) || fee <= 0) return null

  const slots = Array.isArray(input.proposedSlots)
    ? input.proposedSlots.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
    : []

  const { rows } = await query(
    `INSERT INTO expert_applications
      (full_name,specialty,clinic_name,area_vi,bio_vi,contact_phone,contact_email,proposed_fee_vnd,proposed_slots)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      input.fullName.trim(), input.specialty.trim(), input.clinicName.trim(), input.areaVi.trim(),
      input.bioVi.trim(), input.contactPhone.trim(), input.contactEmail.trim(), Math.round(fee),
      JSON.stringify(slots),
    ],
  )
  return toShape(rows[0])
}

export async function listExpertApplications(status) {
  const { rows } = await query(
    `SELECT * FROM expert_applications ${status ? 'WHERE status = $1' : ''} ORDER BY submitted_at DESC`,
    status ? [status] : [],
  )
  return rows.map(toShape)
}

// Duyệt đơn: tạo thẳng 1 dòng experts với ĐÚNG mức phí/khung giờ người nộp đơn tự đề xuất (kể cả
// cao hơn mặt bằng chung) — nền tảng không can thiệp giá, chỉ xác thực hồ sơ. Chưa có certifications
// (chờ chuyên gia tự bổ sung/quản trị viên xác thực sau, xem adminService.updateExpertCertifications).
export async function reviewExpertApplication(id, decision, note) {
  const { rows } = await query('SELECT * FROM expert_applications WHERE id = $1', [id])
  const application = rows[0]
  if (!application || application.status !== 'pending') return null

  if (decision === 'approved') {
    const baseId = `bs_${slugify(application.full_name)}`
    let expertId = baseId
    let suffix = 1
    while ((await query('SELECT 1 FROM experts WHERE id = $1', [expertId])).rows.length > 0) {
      suffix += 1
      expertId = `${baseId}_${suffix}`
    }

    await query(
      `INSERT INTO experts (id,name,specialty,clinic_name,area_vi,bio_vi,certifications,rating_avg,reviews,available_slots,consultation_fee_vnd)
       VALUES ($1,$2,$3,$4,$5,$6,'[]',0,'[]',$7,$8)`,
      [expertId, application.full_name, application.specialty, application.clinic_name, application.area_vi,
        application.bio_vi, application.proposed_slots, application.proposed_fee_vnd],
    )
    const { rows: updated } = await query(
      `UPDATE expert_applications
       SET status = 'approved', admin_note = $2, created_expert_id = $3, reviewed_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, note ?? null, expertId],
    )
    return toShape(updated[0])
  }

  const { rows: updated } = await query(
    `UPDATE expert_applications
     SET status = 'rejected', admin_note = $2, reviewed_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, note ?? null],
  )
  return toShape(updated[0])
}
