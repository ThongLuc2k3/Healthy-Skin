import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { query } from '../db/connection.js'

const UPLOAD_DIR = path.resolve('uploads/expert_reports')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
}

function toShape(row) {
  return {
    id: row.id,
    originalName: row.original_name,
    source: row.source,
    // Đường dẫn tương đối theo quy ước apiClient (không có tiền tố /api)
    fileUrl: `/profile/expert-report/${row.id}/file`,
    uploadedAt: row.uploaded_at,
  }
}

export async function addExpertReport(userId, file) {
  const ext = EXT_BY_MIME[file.mimetype] || ''
  const filename = `${crypto.randomUUID()}${ext}`
  const filePath = path.join(UPLOAD_DIR, filename)
  fs.writeFileSync(filePath, file.buffer)

  const { rows } = await query(
    `INSERT INTO expert_reports (user_id,file_path,file_mime,original_name,source)
     VALUES ($1,$2,$3,$4,'user_upload') RETURNING *`,
    [userId, filePath, file.mimetype, file.originalname?.slice(0, 200) || null],
  )
  return toShape(rows[0])
}

export async function listExpertReports(userId) {
  const { rows } = await query(
    'SELECT * FROM expert_reports WHERE user_id=$1 ORDER BY uploaded_at DESC',
    [userId],
  )
  return rows.map(toShape)
}

// Trả về row thô — dùng nội bộ ở route file để kiểm tra ownership + lấy path thật.
export async function getExpertReportRawById(id) {
  const { rows } = await query('SELECT * FROM expert_reports WHERE id=$1', [id])
  return rows[0]
}

export async function deleteExpertReport(userId, id) {
  const row = await getExpertReportRawById(id)
  if (!row || row.user_id !== userId) return false
  fs.unlink(row.file_path, () => {})
  await query('DELETE FROM expert_reports WHERE id=$1', [id])
  return true
}
