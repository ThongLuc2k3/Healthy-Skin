import { query } from '../db/connection.js'
import { uploadBuffer, deleteFile, extractPublicId } from './cloudinaryService.js'

// Bình luận dùng CHUNG cho cả đánh giá (Diễn đàn) và bài đăng (Góc truyền động lực) — 1 bảng
// review_comments với 2 cột khoá ngoại (review_id / motivation_post_id), đúng 1 trong 2 luôn có giá
// trị tuỳ theo đang bình luận cho loại nội dung nào (xem targetColumn). Gộp chung để không phải
// nhân đôi toàn bộ logic bình luận/trả lời/thích/sửa/xoá riêng cho Góc truyền động lực.
function targetColumn(targetType) {
  return targetType === 'motivation' ? 'motivation_post_id' : 'review_id'
}

function toImagePaths(row) {
  if (row.image_paths?.length) return row.image_paths
  if (row.image_path) return [row.image_path]
  return []
}

export async function listComments(targetType, targetId, viewerId) {
  const col = targetColumn(targetType)
  const { rows } = await query(
    `SELECT c.id, c.parent_comment_id, c.user_id, c.content, c.image_path, c.image_paths, c.created_at,
       COALESCE(u.full_name, 'Người dùng HEALTHY SKIN') AS author_name,
       (SELECT COUNT(*)::int FROM comment_reactions WHERE comment_id = c.id AND reaction = 'like') AS like_count,
       (SELECT COUNT(*)::int FROM comment_reactions WHERE comment_id = c.id AND reaction = 'dislike') AS dislike_count
     FROM review_comments c JOIN users u ON u.id = c.user_id
     WHERE c.${col} = $1 ORDER BY c.created_at ASC`,
    [targetId],
  )

  let myReactions = {}
  if (viewerId && rows.length > 0) {
    const { rows: reactionRows } = await query(
      `SELECT comment_id, reaction FROM comment_reactions WHERE user_id = $1 AND comment_id = ANY($2::bigint[])`,
      [viewerId, rows.map((r) => r.id)],
    )
    myReactions = Object.fromEntries(reactionRows.map((r) => [String(r.comment_id), r.reaction]))
  }

  return rows.map((r) => ({
    id: r.id,
    parentCommentId: r.parent_comment_id,
    userId: r.user_id,
    content: r.content,
    imagePaths: toImagePaths(r),
    createdAt: r.created_at,
    authorName: r.author_name,
    likeCount: r.like_count,
    dislikeCount: r.dislike_count,
    myReaction: myReactions[String(r.id)] || null,
  }))
}

const MAX_IMAGES = 6

// Ảnh bình luận lưu Cloudinary (files ở đây là buffer trong RAM từ multer.memoryStorage, không phải
// file đã ghi ổ đĩa) — cùng lý do với review.routes.js: ổ đĩa local trên Render bị xoá mỗi lần deploy.
async function uploadCommentImages(files) {
  const uploaded = await Promise.all(
    (files || []).slice(0, MAX_IMAGES).map((f) => uploadBuffer(f.buffer, f.mimetype, { folder: 'healthyskin/comments' })),
  )
  return uploaded.map((u) => u.url)
}

function deleteOldImages(paths) {
  for (const p of paths) {
    if (typeof p === 'string' && p.startsWith('http')) {
      const publicId = extractPublicId(p)
      if (publicId) deleteFile(publicId)
    }
  }
}

export async function createComment(targetType, targetId, userId, { content, parentCommentId }, files) {
  const col = targetColumn(targetType)
  const cleanContent = String(content || '').trim().slice(0, 1000)
  const imagePaths = await uploadCommentImages(files)
  if (!cleanContent && imagePaths.length === 0) return null

  const { rows } = await query(
    `INSERT INTO review_comments (${col}, parent_comment_id, user_id, content, image_paths)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, parent_comment_id, user_id, content, image_paths, created_at`,
    [targetId, parentCommentId || null, userId, cleanContent, imagePaths.length ? imagePaths : null],
  )
  const { rows: userRows } = await query('SELECT full_name FROM users WHERE id=$1', [userId])
  const row = rows[0]
  return {
    id: row.id,
    parentCommentId: row.parent_comment_id,
    userId: row.user_id,
    content: row.content,
    imagePaths: row.image_paths || [],
    createdAt: row.created_at,
    authorName: userRows[0]?.full_name || 'Người dùng HEALTHY SKIN',
    likeCount: 0,
    dislikeCount: 0,
    myReaction: null,
  }
}

// Ảnh mới (nếu có) THAY THẾ hoàn toàn ảnh cũ — đơn giản hoá thay vì hỗ trợ thêm/bớt từng ảnh riêng lẻ.
export async function updateComment(userId, commentId, { content, removeImages }, files) {
  const { rows } = await query('SELECT * FROM review_comments WHERE id=$1', [commentId])
  const comment = rows[0]
  if (!comment || Number(comment.user_id) !== Number(userId)) return null

  const cleanContent = String(content || '').trim().slice(0, 1000)
  let imagePaths = toImagePaths(comment)

  if (files && files.length > 0) {
    deleteOldImages(imagePaths)
    imagePaths = await uploadCommentImages(files)
  } else if (removeImages === 'true') {
    deleteOldImages(imagePaths)
    imagePaths = []
  }
  if (!cleanContent && imagePaths.length === 0) return null

  const { rows: updated } = await query(
    `UPDATE review_comments SET content=$2, image_paths=$3, image_path=NULL WHERE id=$1
     RETURNING id, parent_comment_id, user_id, content, image_paths, created_at`,
    [commentId, cleanContent, imagePaths.length ? imagePaths : null],
  )
  const row = updated[0]
  return {
    id: row.id,
    parentCommentId: row.parent_comment_id,
    userId: row.user_id,
    content: row.content,
    imagePaths: row.image_paths || [],
    createdAt: row.created_at,
  }
}

export async function deleteComment(userId, commentId) {
  const { rows } = await query('SELECT * FROM review_comments WHERE id=$1', [commentId])
  const comment = rows[0]
  if (!comment || Number(comment.user_id) !== Number(userId)) return false
  deleteOldImages(toImagePaths(comment))
  await query('DELETE FROM review_comments WHERE id=$1', [commentId])
  return true
}

export async function toggleCommentReaction(commentId, userId, reaction) {
  const { rows: existing } = await query(
    'SELECT reaction FROM comment_reactions WHERE comment_id=$1 AND user_id=$2', [commentId, userId],
  )

  let myReaction = reaction
  if (existing[0]?.reaction === reaction) {
    await query('DELETE FROM comment_reactions WHERE comment_id=$1 AND user_id=$2', [commentId, userId])
    myReaction = null
  } else if (existing[0]) {
    await query(
      'UPDATE comment_reactions SET reaction=$3, created_at=NOW() WHERE comment_id=$1 AND user_id=$2',
      [commentId, userId, reaction],
    )
  } else {
    await query('INSERT INTO comment_reactions (comment_id, user_id, reaction) VALUES ($1,$2,$3)', [commentId, userId, reaction])
  }

  const { rows: counts } = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM comment_reactions WHERE comment_id=$1 AND reaction='like') AS like_count,
       (SELECT COUNT(*)::int FROM comment_reactions WHERE comment_id=$1 AND reaction='dislike') AS dislike_count`,
    [commentId],
  )
  return { myReaction, likeCount: counts[0].like_count, dislikeCount: counts[0].dislike_count }
}
