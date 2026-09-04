import { query } from '../db/connection.js'
import { addLoyaltyPoints } from './chatWalletService.js'
import { getBadgeTier } from './followService.js'
import { deleteFile, extractPublicId } from './cloudinaryService.js'

// Điểm thưởng demo cho chủ bài đăng — cộng vào loyalty_points có sẵn (dùng đổi voucher ở Kho
// Voucher), KHÔNG phải tiền thật. Xem/tim tính điểm tối đa 1 lần/người/bài để tránh cày điểm ảo.
const POINTS_PER_VIEW = 1
const POINTS_PER_LIKE = 5

function toShape(row, likedByMe) {
  return {
    id: row.id,
    userId: row.user_id,
    // Chỉ dùng full_name công khai, KHÔNG fallback về email (xem listPosts) — tránh lộ email người
    // đăng bài cho người xem lạ.
    authorName: row.author_name || 'Người dùng HEALTHY SKIN',
    authorSocialLink: row.social_link || null,
    authorFollowerCount: row.follower_count || 0,
    authorBadgeTier: getBadgeTier(row.follower_count || 0),
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    videoFileUrl: row.video_path || null,
    // video_path giờ chứa cả ảnh lẫn video tự tải lên (đổi tên cột sẽ rườm rà không cần thiết) —
    // mediaType cho frontend biết render <img> hay <video>.
    mediaType: row.video_mime?.startsWith('image/') ? 'image' : 'video',
    viewCount: row.view_count,
    likeCount: row.like_count,
    likedByMe: Boolean(likedByMe),
    commentCount: row.comment_count || 0,
    createdAt: row.created_at,
  }
}

async function fetchAndShape(whereClause, params, viewerUserId) {
  const { rows } = await query(
    `SELECT p.*, u.full_name AS author_name, u.social_link,
       (SELECT COUNT(*)::int FROM user_follows f WHERE f.followed_id = u.id) + COALESCE(u.follower_boost, 0) AS follower_count,
       (SELECT COUNT(*)::int FROM review_comments c WHERE c.motivation_post_id = p.id) AS comment_count
     FROM motivation_posts p JOIN users u ON u.id = p.user_id
     ${whereClause}
     ORDER BY p.created_at DESC`,
    params,
  )
  if (!viewerUserId || rows.length === 0) return rows.map((r) => toShape(r, false))

  const { rows: likedRows } = await query(
    `SELECT post_id FROM motivation_post_likes WHERE user_id = $1 AND post_id = ANY($2::bigint[])`,
    [viewerUserId, rows.map((r) => r.id)],
  )
  const likedSet = new Set(likedRows.map((r) => Number(r.post_id)))
  return rows.map((r) => toShape(r, likedSet.has(Number(r.id))))
}

export async function listPosts(viewerUserId) {
  return fetchAndShape('', [], viewerUserId)
}

export async function listPostsByUser(authorUserId, viewerUserId) {
  return fetchAndShape('WHERE p.user_id = $1', [authorUserId], viewerUserId)
}

// Đúng 1 trong 2 nguồn video phải có: videoUrl (dán link) hoặc file (tự tải lên) — không cả hai,
// không thiếu cả hai. file ở đây là { url, mimetype } đã upload lên Cloudinary xong (xem
// motivation.routes.js), url là link Cloudinary tuyệt đối, không phải đường dẫn local.
export async function createPost(userId, { title, description, videoUrl }, file) {
  const cleanTitle = String(title || '').trim().slice(0, 200)
  const cleanUrl = typeof videoUrl === 'string' ? videoUrl.trim().slice(0, 500) : ''
  if (!cleanTitle || (!cleanUrl && !file) || (cleanUrl && file)) return null

  const videoPath = file ? file.url : null
  const videoMime = file ? file.mimetype : null

  const { rows } = await query(
    `INSERT INTO motivation_posts (user_id, title, description, video_url, video_path, video_mime)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [userId, cleanTitle, String(description || '').trim().slice(0, 1000), cleanUrl || null, videoPath, videoMime],
  )
  const { rows: userRows } = await query('SELECT full_name, social_link FROM users WHERE id=$1', [userId])
  return toShape({ ...rows[0], author_name: userRows[0]?.full_name, social_link: userRows[0]?.social_link }, false)
}

export async function recordView(postId, viewerUserId) {
  if (!viewerUserId) {
    await query('UPDATE motivation_posts SET view_count = view_count + 1 WHERE id=$1', [postId])
    return
  }

  const { rows } = await query(
    `INSERT INTO motivation_post_views (post_id, user_id) VALUES ($1,$2)
     ON CONFLICT DO NOTHING RETURNING post_id`,
    [postId, viewerUserId],
  )
  if (rows.length === 0) return // đã tính lượt xem này trước đó rồi

  const { rows: postRows } = await query(
    'UPDATE motivation_posts SET view_count = view_count + 1 WHERE id=$1 RETURNING user_id',
    [postId],
  )
  const ownerId = postRows[0]?.user_id
  if (ownerId && Number(ownerId) !== Number(viewerUserId)) {
    await addLoyaltyPoints(ownerId, POINTS_PER_VIEW)
  }
}

export async function toggleLike(postId, userId) {
  const { rows: postRows } = await query('SELECT user_id FROM motivation_posts WHERE id=$1', [postId])
  const post = postRows[0]
  if (!post) return null

  const { rows: existing } = await query(
    'SELECT 1 FROM motivation_post_likes WHERE post_id=$1 AND user_id=$2', [postId, userId],
  )

  let liked
  if (existing.length > 0) {
    await query('DELETE FROM motivation_post_likes WHERE post_id=$1 AND user_id=$2', [postId, userId])
    await query('UPDATE motivation_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id=$1', [postId])
    if (Number(post.user_id) !== Number(userId)) await addLoyaltyPoints(post.user_id, -POINTS_PER_LIKE)
    liked = false
  } else {
    await query('INSERT INTO motivation_post_likes (post_id, user_id) VALUES ($1,$2)', [postId, userId])
    await query('UPDATE motivation_posts SET like_count = like_count + 1 WHERE id=$1', [postId])
    if (Number(post.user_id) !== Number(userId)) await addLoyaltyPoints(post.user_id, POINTS_PER_LIKE)
    liked = true
  }
  const { rows } = await query('SELECT like_count FROM motivation_posts WHERE id=$1', [postId])
  return { liked, likeCount: rows[0].like_count }
}

// Chỉ sửa tiêu đề/mô tả — không đổi media (link/file) để giữ đơn giản, ai muốn đổi ảnh/video thì xoá
// đăng lại bài mới.
export async function updatePost(userId, postId, { title, description }) {
  const { rows: existing } = await query('SELECT user_id FROM motivation_posts WHERE id=$1', [postId])
  if (!existing[0] || Number(existing[0].user_id) !== Number(userId)) return null

  const cleanTitle = String(title || '').trim().slice(0, 200)
  if (!cleanTitle) return null

  await query(
    'UPDATE motivation_posts SET title=$2, description=$3 WHERE id=$1',
    [postId, cleanTitle, String(description || '').trim().slice(0, 1000)],
  )
  const [updated] = await fetchAndShape('WHERE p.id = $1', [postId], userId)
  return updated
}

export async function deletePost(userId, postId) {
  const { rows } = await query('SELECT * FROM motivation_posts WHERE id=$1', [postId])
  const post = rows[0]
  if (!post || Number(post.user_id) !== Number(userId)) return false
  // video_path có thể là URL Cloudinary (mới) hoặc đường dẫn local "/uploads/..." (dữ liệu cũ trước
  // khi chuyển sang Cloudinary, file local trên Render đã mất từ lâu nên bỏ qua, không cần fs.unlink).
  if (post.video_path?.startsWith('http')) {
    const publicId = extractPublicId(post.video_path)
    if (publicId) deleteFile(publicId, post.video_mime?.startsWith('video/') ? 'video' : 'image')
  }
  await query('DELETE FROM motivation_posts WHERE id=$1', [postId])
  return true
}
