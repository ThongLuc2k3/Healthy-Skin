import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAdminAuth, signAdminToken } from '../middleware/adminAuth.js'
import { authenticateAdmin } from '../services/adminAccountService.js'
import {
  getOverviewStats,
  listMembers,
  listMemberTransactions,
  setMemberLock,
  listActivity,
  listExpertsAdmin,
  createExpert,
  updateExpert,
  updateExpertCertifications,
  deleteExpert,
  listSponsoredPlacementsAdmin,
  updateSponsoredPlacement,
} from '../services/adminService.js'
import { listVenueApplications, reviewVenueApplication } from '../services/venueApplicationService.js'
import { listExpertApplications, reviewExpertApplication } from '../services/expertApplicationService.js'

const router = Router()

// Trang Quản trị (Admin) — quản lý doanh thu, thành viên, chuyên gia, đơn đăng ký đối tác và vị trí
// hiển thị sản phẩm tài trợ. Đăng nhập bằng tài khoản riêng trong bảng admin_accounts (seedAdminAccount).

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' })
  }

  const account = await authenticateAdmin(email, password)
  if (!account) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' })
  }

  const token = signAdminToken(account)
  res.json({ token, admin: { id: account.id, email: account.email, name: account.name } })
}))

router.use(requireAdminAuth)

router.get('/overview', asyncHandler(async (req, res) => {
  res.json(await getOverviewStats())
}))

router.get('/members', asyncHandler(async (req, res) => {
  res.json(await listMembers())
}))

router.get('/members/:id/transactions', asyncHandler(async (req, res) => {
  res.json(await listMemberTransactions(Number(req.params.id)))
}))

router.post('/members/:id/lock', asyncHandler(async (req, res) => {
  const { reason } = req.body ?? {}
  const result = await setMemberLock(Number(req.params.id), true, typeof reason === 'string' ? reason.trim().slice(0, 300) : '')
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy thành viên.' })
  }
  res.json(result)
}))

router.post('/members/:id/unlock', asyncHandler(async (req, res) => {
  const result = await setMemberLock(Number(req.params.id), false, '')
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy thành viên.' })
  }
  res.json(result)
}))

router.get('/activity', asyncHandler(async (req, res) => {
  const { type, q, limit, offset } = req.query ?? {}
  res.json(await listActivity({
    type: typeof type === 'string' ? type : undefined,
    q: typeof q === 'string' ? q : undefined,
    limit: Math.min(Number(limit) || 50, 200),
    offset: Number(offset) || 0,
  }))
}))

router.get('/experts', asyncHandler(async (req, res) => {
  res.json(await listExpertsAdmin())
}))

router.post('/experts', asyncHandler(async (req, res) => {
  const { name, specialty, clinicName, areaVi, bioVi, consultationFeeVnd, availableSlots } = req.body ?? {}
  if (![name, specialty, clinicName, areaVi, bioVi].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' })
  }
  const id = await createExpert({ name, specialty, clinicName, areaVi, bioVi, consultationFeeVnd, availableSlots })
  res.status(201).json({ id })
}))

router.put('/experts/:id', asyncHandler(async (req, res) => {
  const { name, specialty, clinicName, areaVi, bioVi, consultationFeeVnd, availableSlots } = req.body ?? {}
  if (![name, specialty, clinicName, areaVi, bioVi].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' })
  }
  const result = await updateExpert(req.params.id, { name, specialty, clinicName, areaVi, bioVi, consultationFeeVnd, availableSlots })
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy chuyên gia.' })
  }
  res.json(result)
}))

router.put('/experts/:id/certifications', asyncHandler(async (req, res) => {
  const { certifications } = req.body ?? {}
  if (!Array.isArray(certifications)) {
    return res.status(400).json({ error: 'certifications phải là một mảng.' })
  }
  const result = await updateExpertCertifications(req.params.id, certifications)
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy chuyên gia.' })
  }
  res.json(result)
}))

router.delete('/experts/:id', asyncHandler(async (req, res) => {
  const result = await deleteExpert(req.params.id)
  if (!result.deleted) {
    return res.status(409).json({
      error: result.reason === 'has_bookings'
        ? 'Không thể xoá vì chuyên gia này đã có lịch hẹn.'
        : 'Không tìm thấy chuyên gia.',
    })
  }
  res.json({ deleted: true })
}))

router.get('/venue-applications', asyncHandler(async (req, res) => {
  res.json(await listVenueApplications(req.query.status))
}))

router.post('/venue-applications/:id/review', asyncHandler(async (req, res) => {
  const { decision, note } = req.body ?? {}
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'Quyết định không hợp lệ (approved/rejected).' })
  }
  const result = await reviewVenueApplication(Number(req.params.id), decision, note)
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hoặc đơn đã được xử lý.' })
  }
  res.json(result)
}))

router.get('/expert-applications', asyncHandler(async (req, res) => {
  res.json(await listExpertApplications(req.query.status))
}))

router.post('/expert-applications/:id/review', asyncHandler(async (req, res) => {
  const { decision, note } = req.body ?? {}
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'Quyết định không hợp lệ (approved/rejected).' })
  }
  const result = await reviewExpertApplication(Number(req.params.id), decision, note)
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hoặc đơn đã được xử lý.' })
  }
  res.json(result)
}))

router.get('/sponsored-placements', asyncHandler(async (req, res) => {
  res.json(await listSponsoredPlacementsAdmin())
}))

router.put('/sponsored-placements/:id', asyncHandler(async (req, res) => {
  const { placements } = req.body ?? {}
  if (!Array.isArray(placements)) {
    return res.status(400).json({ error: 'placements phải là một mảng.' })
  }
  const result = await updateSponsoredPlacement(req.params.id, placements)
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' })
  }
  res.json(result)
}))

export default router
