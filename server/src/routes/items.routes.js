import { Router } from 'express'
import { listSkincareItems, listFoodItems } from '../services/itemService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

router.get('/skincare', asyncHandler(async (req, res) => {
  res.json(await listSkincareItems())
}))

router.get('/food', asyncHandler(async (req, res) => {
  res.json(await listFoodItems())
}))

export default router
