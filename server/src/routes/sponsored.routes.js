import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { listSponsoredProducts, listHomepageAds } from '../services/sponsoredContentService.js'

const router = Router()

router.get('/products', asyncHandler(async (req, res) => {
  res.json(await listSponsoredProducts(req.query.placement))
}))

router.get('/ads', asyncHandler(async (req, res) => {
  res.json(await listHomepageAds())
}))

export default router
