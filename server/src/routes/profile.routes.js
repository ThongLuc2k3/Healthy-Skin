import { Router } from 'express'
import fs from 'node:fs'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { profileUploadLimiter } from '../middleware/rateLimit.js'
import {
  getProfile,
  saveProfile,
  hasGivenConsent,
  giveConsent,
  revokeConsent,
  deleteSensitiveData,
  setFacePhoto,
  deleteFacePhoto,
  setDiagnosedConditions,
} from '../services/profileService.js'
import {
  addExpertReport,
  listExpertReports,
  getExpertReportRawById,
  deleteExpertReport,
} from '../services/expertReportService.js'
import { extractDiagnosedConditions } from '../services/reportExtractionService.js'

const router = Router()

const MAX_NOTE_LENGTH = 500

function sanitizeNote(value) {
  return typeof value === 'string' ? value.slice(0, MAX_NOTE_LENGTH) : ''
}

// Ảnh khuôn mặt + báo cáo khám là dữ liệu sinh trắc học/sức khoẻ — bắt buộc phải có
// sự đồng ý rõ ràng trước khi bất kỳ API upload nào trong nhóm 9C hoạt động.
const requireConsent = asyncHandler(async (req, res, next) => {
  if (!await hasGivenConsent(req.userId)) {
    return res.status(403).json({
      error: 'Bạn cần đồng ý sử dụng dữ liệu nhạy cảm (ảnh khuôn mặt/bệnh lý) trước khi dùng tính năng này.',
    })
  }
  next()
})

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file ảnh.'))
    }
    cb(null, true)
  },
})

const reportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      return cb(new Error('Chỉ chấp nhận file ảnh hoặc PDF.'))
    }
    cb(null, true)
  },
})

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  res.json(await getProfile(req.userId))
}))

router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const {
    skinType,
    allergies,
    conditions,
    goals,
    skinTypeNote,
    allergiesNote,
    conditionsNote,
    goalsNote,
  } = req.body ?? {}

  if (typeof skinType !== 'string') {
    return res.status(400).json({ error: 'Dữ liệu hồ sơ không hợp lệ.' })
  }

  const saved = await saveProfile(req.userId, {
    skinType,
    allergies: Array.isArray(allergies) ? allergies : [],
    conditions: Array.isArray(conditions) ? conditions : [],
    goals: Array.isArray(goals) ? goals : [],
    skinTypeNote: sanitizeNote(skinTypeNote),
    allergiesNote: sanitizeNote(allergiesNote),
    conditionsNote: sanitizeNote(conditionsNote),
    goalsNote: sanitizeNote(goalsNote),
  })
  res.json(saved)
}))

// --- 9C: Hồ sơ mở rộng (ảnh khuôn mặt + bệnh lý + báo cáo khám) ---
// Toàn bộ nhóm endpoint dưới đây xử lý dữ liệu nhạy cảm, KHÔNG được dùng để
// suy diễn/hiển thị bất kỳ "chẩn đoán" nào — chỉ lưu trữ những gì người dùng tự khai.

router.post('/consent', requireAuth, asyncHandler(async (req, res) => {
  res.json(await giveConsent(req.userId))
}))

// Thu hồi đồng ý — chỉ tắt cờ, không xoá dữ liệu đã có (xem DELETE /sensitive-data để xoá hẳn).
router.delete('/consent', requireAuth, asyncHandler(async (req, res) => {
  res.json(await revokeConsent(req.userId))
}))

// Xoá hẳn dữ liệu nhạy cảm (ảnh khuôn mặt, bệnh lý đã chẩn đoán, báo cáo khám) — không xoá tài khoản.
router.delete('/sensitive-data', requireAuth, asyncHandler(async (req, res) => {
  res.json(await deleteSensitiveData(req.userId))
}))

router.put('/diagnosed-conditions', requireAuth, asyncHandler(async (req, res) => {
  if (!await hasGivenConsent(req.userId)) {
    return res.status(403).json({ error: 'Bạn cần đồng ý sử dụng dữ liệu nhạy cảm trước khi khai bệnh lý.' })
  }
  const { diagnosedConditions } = req.body ?? {}
  if (!Array.isArray(diagnosedConditions)) {
    return res.status(400).json({ error: 'Danh sách bệnh lý không hợp lệ.' })
  }
  res.json(await setDiagnosedConditions(req.userId, diagnosedConditions))
}))

router.post(
  '/face-photo',
  requireAuth,
  requireConsent,
  profileUploadLimiter,
  imageUpload.single('facePhoto'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn một ảnh.' })
    }
    res.json(await setFacePhoto(req.userId, req.file))
  }),
)

router.delete('/face-photo', requireAuth, asyncHandler(async (req, res) => {
  res.json(await deleteFacePhoto(req.userId))
}))

router.get('/face-photo', requireAuth, asyncHandler(async (req, res) => {
  const file = await getFacePhotoFile(req.userId)
  if (!file || !fs.existsSync(file.path)) {
    return res.status(404).json({ error: 'Chưa có ảnh khuôn mặt.' })
  }
  res.setHeader('Content-Type', file.mime || 'image/jpeg')
  res.sendFile(file.path)
}))

router.get('/expert-reports', requireAuth, asyncHandler(async (req, res) => {
  res.json(await listExpertReports(req.userId))
}))

router.post(
  '/expert-report',
  requireAuth,
  requireConsent,
  profileUploadLimiter,
  reportUpload.single('report'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn một file ảnh hoặc PDF.' })
    }
    const report = await addExpertReport(req.userId, req.file)
    // AI đọc lại file để gợi ý điền sẵn bệnh lý — chỉ là gợi ý, người dùng vẫn phải tự bấm "Lưu bệnh
    // lý" ở bước sau mới thật sự lưu (xem reportExtractionService).
    const suggestedConditions = await extractDiagnosedConditions(req.file.buffer, req.file.mimetype)
    res.status(201).json({ ...report, suggestedConditions })
  }),
)

router.delete('/expert-report/:id', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ.' })
  }
  const deleted = await deleteExpertReport(req.userId, id)
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy báo cáo.' })
  }
  res.json({ ok: true })
}))

router.get('/expert-report/:id/file', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ.' })
  }
  const report = await getExpertReportRawById(id)
  if (!report || Number(report.user_id) !== Number(req.userId) || !fs.existsSync(report.file_path)) {
    return res.status(404).json({ error: 'Không tìm thấy báo cáo.' })
  }
  res.setHeader('Content-Type', report.file_mime || 'application/octet-stream')
  res.sendFile(report.file_path)
}))

export default router
