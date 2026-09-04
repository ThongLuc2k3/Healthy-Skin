import { Router } from 'express'
import config from '../config/env.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { getSettlementSummary } from '../services/settlementService.js'

const router = Router()

// Báo cáo đối soát nội bộ — CHƯA có hệ vai trò admin thật trong repo, dùng shared secret tạm thời
// qua header x-admin-token. Nếu ADMIN_TOKEN rỗng (mặc định), route từ chối mọi request, không mở
// public. Thay bằng xác thực admin thật khi có.
function requireAdminToken(req, res, next) {
  if (!config.adminToken || req.get('x-admin-token') !== config.adminToken) {
    return res.status(403).json({ error: 'Không có quyền truy cập báo cáo đối soát.' })
  }
  next()
}

router.get('/summary', requireAdminToken, asyncHandler(async (req, res) => {
  const { from, to } = req.query
  res.json(await getSettlementSummary({ from, to }))
}))

export default router
