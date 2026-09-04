import { Router } from 'express'
import multer from 'multer'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { profileUploadLimiter } from '../middleware/rateLimit.js'
import { listPosts, createPost, updatePost, recordView, toggleLike, deletePost } from '../services/motivationPostService.js'
import { listComments, createComment, updateComment, deleteComment, toggleCommentReaction } from '../services/commentService.js'
import { uploadBuffer } from '../services/cloudinaryService.js'

const router = Router()

// Ảnh/video đăng ở Góc truyền động lực lưu Cloudinary (memoryStorage, KHÔNG ghi ổ đĩa local) — cùng
// lý do với review.routes.js: ổ đĩa tạm thời trên Render bị xoá mỗi lần deploy.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/') && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file ảnh hoặc video.'))
    }
    cb(null, true)
  },
})

// Bình luận (kể cả ảnh đính kèm) dùng CHUNG logic với review.routes.js — xem commentService.js.
const MAX_COMMENT_IMAGES = 6
const uploadCommentImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_COMMENT_IMAGES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Chỉ chấp nhận file hình ảnh!'))
    cb(null, true)
  },
})

router.get('/posts/:id/comments', optionalAuth, asyncHandler(async (req, res) => {
  res.json(await listComments('motivation', req.params.id, req.userId))
}))

router.post('/posts/:id/comments', requireAuth, uploadCommentImages.array('images', MAX_COMMENT_IMAGES), asyncHandler(async (req, res) => {
  const created = await createComment('motivation', req.params.id, req.userId, req.body ?? {}, req.files)
  if (!created) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung hoặc đính kèm ảnh.' })
  }
  res.status(201).json(created)
}))

router.put('/comments/:commentId', requireAuth, uploadCommentImages.array('images', MAX_COMMENT_IMAGES), asyncHandler(async (req, res) => {
  const updated = await updateComment(req.userId, req.params.commentId, req.body ?? {}, req.files)
  if (!updated) {
    return res.status(400).json({ error: 'Không tìm thấy bình luận, bạn không phải chủ bình luận, hoặc bình luận cần có nội dung/ảnh.' })
  }
  res.json(updated)
}))

router.delete('/comments/:commentId', requireAuth, asyncHandler(async (req, res) => {
  const deleted = await deleteComment(req.userId, req.params.commentId)
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy bình luận hoặc bạn không phải chủ bình luận.' })
  }
  res.json({ ok: true })
}))

router.post('/comments/:commentId/reaction', requireAuth, asyncHandler(async (req, res) => {
  const { reaction } = req.body ?? {}
  if (!['like', 'dislike'].includes(reaction)) {
    return res.status(400).json({ error: 'Phản ứng không hợp lệ.' })
  }
  res.json(await toggleCommentReaction(req.params.commentId, req.userId, reaction))
}))

router.get('/posts', optionalAuth, asyncHandler(async (req, res) => {
  res.json(await listPosts(req.userId))
}))

router.post(
  '/posts',
  requireAuth,
  profileUploadLimiter,
  upload.single('video'),
  asyncHandler(async (req, res) => {
    const { title, description, videoUrl } = req.body ?? {}
    const uploaded = req.file
      ? await uploadBuffer(req.file.buffer, req.file.mimetype, { folder: 'healthyskin/motivation' })
      : null
    const post = await createPost(
      req.userId,
      { title, description, videoUrl },
      uploaded ? { url: uploaded.url, mimetype: req.file.mimetype } : null,
    )
    if (!post) {
      return res.status(400).json({
        error: 'Vui lòng nhập tiêu đề và cung cấp đúng 1 nguồn nội dung: dán link video hoặc tải file ảnh/video lên, không cả hai.',
      })
    }
    res.status(201).json(post)
  }),
)

router.put('/posts/:id', requireAuth, asyncHandler(async (req, res) => {
  const { title, description } = req.body ?? {}
  const updated = await updatePost(req.userId, Number(req.params.id), { title, description })
  if (!updated) {
    return res.status(400).json({ error: 'Vui lòng nhập tiêu đề, hoặc bạn không phải chủ bài đăng.' })
  }
  res.json(updated)
}))

router.post('/posts/:id/view', optionalAuth, asyncHandler(async (req, res) => {
  await recordView(Number(req.params.id), req.userId)
  res.json({ ok: true })
}))

router.post('/posts/:id/like', requireAuth, asyncHandler(async (req, res) => {
  const result = await toggleLike(Number(req.params.id), req.userId)
  if (!result) {
    return res.status(404).json({ error: 'Không tìm thấy bài đăng.' })
  }
  res.json(result)
}))

router.delete('/posts/:id', requireAuth, asyncHandler(async (req, res) => {
  const deleted = await deletePost(req.userId, Number(req.params.id))
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy bài đăng hoặc bạn không phải chủ bài.' })
  }
  res.json({ ok: true })
}))

export default router
