import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { getPublicProfile, toggleFollow, listFollowers } from '../services/followService.js'
import { listPostsByUser } from '../services/motivationPostService.js'

const router = Router()

// Trang cá nhân công khai — tên, link MXH, số người theo dõi, huy hiệu, và các video đã đăng ở
// Góc truyền động lực. Công khai (optionalAuth) để khách chưa đăng nhập vẫn xem được, chỉ cần đăng
// nhập mới bấm theo dõi được.
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const userId = Number(req.params.id)
  const profile = await getPublicProfile(userId, req.userId)
  if (!profile) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng.' })
  }
  const posts = await listPostsByUser(userId, req.userId)
  res.json({ ...profile, posts })
}))

router.get('/:id/followers', asyncHandler(async (req, res) => {
  res.json(await listFollowers(Number(req.params.id)))
}))

router.post('/:id/follow', requireAuth, asyncHandler(async (req, res) => {
  try {
    const result = await toggleFollow(req.userId, Number(req.params.id))
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}))

export default router
