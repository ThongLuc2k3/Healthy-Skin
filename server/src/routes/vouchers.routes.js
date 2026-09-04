import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import {
  listVoucherCatalog,
  listUserVouchers,
  redeemVoucherWithPoints,
  awardVoucher,
} from '../services/voucherService.js'

const router = Router()

const GAME_REWARD_VOUCHER_ID = 'voucher_skinlab_game'

router.get('/', asyncHandler(async (req, res) => {
  res.json(await listVoucherCatalog())
}))

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  res.json(await listUserVouchers(req.userId, { onlyUnused: req.query.onlyUnused === 'true' }))
}))

router.post('/redeem', requireAuth, asyncHandler(async (req, res) => {
  const { voucherId } = req.body ?? {}
  if (typeof voucherId !== 'string' || !voucherId) {
    return res.status(400).json({ error: 'Vui lòng chọn voucher muốn đổi.' })
  }
  try {
    const result = await redeemVoucherWithPoints(req.userId, voucherId)
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}))

// Thưởng voucher khi hoàn thành mini-game ở Skin Lab — demo, không giới hạn số lần trong phạm vi
// đồ án (một hệ thống thật sẽ cần giới hạn theo ngày để tránh lạm dụng).
router.post('/game-reward', requireAuth, asyncHandler(async (req, res) => {
  try {
    const result = await awardVoucher(req.userId, GAME_REWARD_VOUCHER_ID, 'game_reward')
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}))

export default router
