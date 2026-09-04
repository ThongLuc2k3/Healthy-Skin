import express from 'express'
import multer from 'multer'
import { query } from '../db/connection.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { getBadgeTier } from '../services/followService.js'
import { listComments, createComment, updateComment, deleteComment, toggleCommentReaction } from '../services/commentService.js'
import { uploadBuffer, deleteFile, extractPublicId } from '../services/cloudinaryService.js'

const router = express.Router()

// Ảnh đánh giá lưu ở Cloudinary (memoryStorage giữ tạm trong RAM rồi upload lên, KHÔNG ghi ổ đĩa
// local) — Render free tier có ổ đĩa tạm thời (ephemeral), mọi file ghi ra local sẽ mất sau mỗi lần
// deploy dù DB (Neon) vẫn còn nguyên dòng review trỏ tới đường dẫn đó, gây ảnh vỡ trên production.
const MAX_IMAGES = 6

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_IMAGES }, // Giới hạn mỗi ảnh 5MB, tối đa 6 ảnh/lần
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh!'))
    }
  }
})

async function uploadReviewImages(files) {
  const uploaded = await Promise.all(
    (files || []).map((f) => uploadBuffer(f.buffer, f.mimetype, { folder: 'healthyskin/reviews' })),
  )
  return uploaded.map((u) => u.url)
}

// Ảnh cũ có thể là URL Cloudinary (mới) hoặc đường dẫn local "/uploads/..." (dữ liệu cũ trước khi
// chuyển sang Cloudinary) — chỉ gọi xoá trên Cloudinary cho URL http(s), bỏ qua đường dẫn local vì
// file local trên Render đã mất từ lâu, gọi fs.unlink cho chúng chỉ tổ vô nghĩa.
function deleteOldImages(paths) {
  for (const p of paths) {
    if (typeof p === 'string' && p.startsWith('http')) {
      const publicId = extractPublicId(p)
      if (publicId) deleteFile(publicId)
    }
  }
}

function toImagePaths(row) {
  if (row.image_paths?.length) return row.image_paths
  if (row.image_path) return [row.image_path]
  return []
}

// 1. GET: Lấy danh sách đánh giá kèm số lượt thích/không thích, số bình luận, huy hiệu/số người theo
// dõi của tác giả, và phản ứng của chính người xem (nếu đã đăng nhập) — optionalAuth để khách chưa
// đăng nhập vẫn xem được danh sách.
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { rows } = await query(`
      SELECT
        r.id, r.user_id, r.rating, r.title, r.content, r.image_path, r.image_paths, r.created_at,
        COALESCE(u.full_name, 'Người dùng HEALTHY SKIN') AS author_name,
        (SELECT COUNT(*)::int FROM user_follows WHERE followed_id = r.user_id) + COALESCE(u.follower_boost, 0) AS author_follower_count,
        (SELECT COUNT(*)::int FROM review_reactions WHERE review_id = r.id AND reaction = 'like') AS like_count,
        (SELECT COUNT(*)::int FROM review_reactions WHERE review_id = r.id AND reaction = 'dislike') AS dislike_count,
        (SELECT COUNT(*)::int FROM review_comments WHERE review_id = r.id) AS comment_count
      FROM website_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `)

  let myReactions = {}
  if (req.userId) {
    const { rows: reactionRows } = await query(
      'SELECT review_id, reaction FROM review_reactions WHERE user_id = $1', [req.userId],
    )
    myReactions = Object.fromEntries(reactionRows.map((r) => [String(r.review_id), r.reaction]))
  }

  const reviews = rows.map((r) => ({
    id: r.id, userId: r.user_id, rating: r.rating, title: r.title, content: r.content,
    imagePaths: toImagePaths(r),
    created_at: r.created_at, author_name: r.author_name,
    authorFollowerCount: r.author_follower_count,
    authorBadgeTier: getBadgeTier(r.author_follower_count || 0),
    likeCount: r.like_count, dislikeCount: r.dislike_count, commentCount: r.comment_count,
    myReaction: myReactions[String(r.id)] || null,
  }))
  res.json({ reviews })
}))

// 2. POST: Gửi đánh giá kèm nhiều ảnh (upload.array('images')) — tên hiển thị lấy thẳng từ họ tên
// tài khoản (users.full_name) lúc đọc, KHÔNG còn cho nhập tay authorName mỗi lần gửi.
router.post('/', requireAuth, upload.array('images', MAX_IMAGES), asyncHandler(async (req, res) => {
  try {
    const { title, content, rating = 5 } = req.body

    const imagePaths = await uploadReviewImages(req.files)

    if (!title || !content) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tiêu đề và nội dung' })
    }

    const { rows } = await query(`
      INSERT INTO website_reviews (user_id, rating, title, content, image_paths)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [req.userId, Number(rating), title.trim(), content.trim(), imagePaths.length ? imagePaths : null])

    res.json({
      success: true,
      reviewId: rows[0].id,
      message: 'Gửi đánh giá kèm hình ảnh thành công!'
    })
  } catch (error) {
    console.error('[Post Review Error]:', error)
    res.status(500).json({ error: 'Không thể gửi đánh giá' })
  }
}))

// Sửa đánh giá — chỉ chủ đánh giá sửa được. Ảnh mới (nếu gửi) THAY THẾ hoàn toàn ảnh cũ (ảnh cũ bị
// xoá khỏi đĩa); removeImages=true để gỡ hẳn không thay ảnh mới; không gửi gì thì giữ nguyên ảnh cũ.
router.put('/:id', requireAuth, upload.array('images', MAX_IMAGES), asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM website_reviews WHERE id=$1', [req.params.id])
  const review = rows[0]
  if (!review || Number(review.user_id) !== Number(req.userId)) {
    return res.status(404).json({ error: 'Không tìm thấy đánh giá hoặc bạn không phải chủ đánh giá.' })
  }
  const { title, content, rating } = req.body ?? {}
  if (!title || !content) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tiêu đề và nội dung' })
  }

  let imagePaths = toImagePaths(review)
  if (req.files?.length) {
    deleteOldImages(imagePaths)
    imagePaths = await uploadReviewImages(req.files)
  } else if (req.body?.removeImages === 'true') {
    deleteOldImages(imagePaths)
    imagePaths = []
  }

  await query(
    `UPDATE website_reviews SET title=$2, content=$3, rating=$4, image_paths=$5, image_path=NULL WHERE id=$1`,
    [req.params.id, title.trim(), content.trim(), Number(rating) || review.rating, imagePaths.length ? imagePaths : null],
  )
  res.json({ ok: true, imagePaths })
}))

// Xoá đánh giá — cascade xoá luôn mọi bình luận/trả lời/phản ứng của nó (ON DELETE CASCADE ở
// review_comments.review_id và review_reactions.review_id).
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM website_reviews WHERE id=$1', [req.params.id])
  const review = rows[0]
  if (!review || Number(review.user_id) !== Number(req.userId)) {
    return res.status(404).json({ error: 'Không tìm thấy đánh giá hoặc bạn không phải chủ đánh giá.' })
  }
  deleteOldImages(toImagePaths(review))
  await query('DELETE FROM website_reviews WHERE id=$1', [req.params.id])
  res.json({ ok: true })
}))

// Đánh giá của chính người dùng đang đăng nhập — dùng cho mục "Hoạt động của tôi" ở trang Tài khoản.
router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const { rows: reviews } = await query(
    `SELECT id, rating, title, content, image_path, image_paths, created_at
     FROM website_reviews WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.userId],
  )
  res.json({ reviews: reviews.map((r) => ({ ...r, imagePaths: toImagePaths(r) })) })
}))

// Trả về bình luận DẠNG PHẲNG (kèm parentCommentId) — frontend tự nhóm reply theo comment cha, vì
// chỉ hỗ trợ đúng 1 cấp lồng (bình luận -> trả lời, không trả lời-của-trả lời). Dùng chung
// commentService — targetType='review' để lọc theo review_id, xem commentService.js.
router.get('/:id/comments', optionalAuth, asyncHandler(async (req, res) => {
  res.json(await listComments('review', req.params.id, req.userId))
}))

router.post('/:id/comments', requireAuth, upload.array('images', MAX_IMAGES), asyncHandler(async (req, res) => {
  const created = await createComment('review', req.params.id, req.userId, req.body ?? {}, req.files)
  if (!created) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung hoặc đính kèm ảnh.' })
  }
  res.status(201).json(created)
}))

// Sửa bình luận/trả lời — chỉ chủ bình luận sửa được. Cùng cơ chế đổi/gỡ ảnh với sửa đánh giá.
router.put('/comments/:commentId', requireAuth, upload.array('images', MAX_IMAGES), asyncHandler(async (req, res) => {
  const updated = await updateComment(req.userId, req.params.commentId, req.body ?? {}, req.files)
  if (!updated) {
    return res.status(400).json({ error: 'Không tìm thấy bình luận, bạn không phải chủ bình luận, hoặc bình luận cần có nội dung/ảnh.' })
  }
  res.json(updated)
}))

// Xoá bình luận/trả lời — chỉ chủ bình luận mới xoá được. Xoá 1 bình luận gốc thì mọi trả lời của
// nó cũng tự mất theo (ON DELETE CASCADE ở review_comments.parent_comment_id), không cần xoá tay
// từng cái. Dọn luôn file ảnh đính kèm nếu có.
router.delete('/comments/:commentId', requireAuth, asyncHandler(async (req, res) => {
  const deleted = await deleteComment(req.userId, req.params.commentId)
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy bình luận hoặc bạn không phải chủ bình luận.' })
  }
  res.json({ ok: true })
}))

// Bật/tắt thích hoặc không thích 1 đánh giá — bấm lại đúng loại đang chọn thì gỡ phản ứng, bấm loại
// khác thì thay thế (đổi like -> dislike hoặc ngược lại), không cộng dồn cả 2.
router.post('/:id/reaction', requireAuth, asyncHandler(async (req, res) => {
  const { reaction } = req.body ?? {}
  if (!['like', 'dislike'].includes(reaction)) {
    return res.status(400).json({ error: 'Phản ứng không hợp lệ.' })
  }

  const { rows: existing } = await query(
    'SELECT reaction FROM review_reactions WHERE review_id=$1 AND user_id=$2',
    [req.params.id, req.userId],
  )

  let myReaction = reaction
  if (existing[0]?.reaction === reaction) {
    await query('DELETE FROM review_reactions WHERE review_id=$1 AND user_id=$2', [req.params.id, req.userId])
    myReaction = null
  } else if (existing[0]) {
    await query(
      'UPDATE review_reactions SET reaction=$3, created_at=NOW() WHERE review_id=$1 AND user_id=$2',
      [req.params.id, req.userId, reaction],
    )
  } else {
    await query(
      'INSERT INTO review_reactions (review_id, user_id, reaction) VALUES ($1,$2,$3)',
      [req.params.id, req.userId, reaction],
    )
  }

  const { rows: counts } = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM review_reactions WHERE review_id=$1 AND reaction='like') AS like_count,
       (SELECT COUNT(*)::int FROM review_reactions WHERE review_id=$1 AND reaction='dislike') AS dislike_count`,
    [req.params.id],
  )
  res.json({ myReaction, likeCount: counts[0].like_count, dislikeCount: counts[0].dislike_count })
}))

// Cùng cơ chế toggle với reaction của đánh giá, nhưng cho 1 bình luận cụ thể.
router.post('/comments/:commentId/reaction', requireAuth, asyncHandler(async (req, res) => {
  const { reaction } = req.body ?? {}
  if (!['like', 'dislike'].includes(reaction)) {
    return res.status(400).json({ error: 'Phản ứng không hợp lệ.' })
  }
  res.json(await toggleCommentReaction(req.params.commentId, req.userId, reaction))
}))

export default router
