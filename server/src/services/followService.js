import { query } from '../db/connection.js'

// 5 mốc số người theo dõi, mỗi mốc 1 huy hiệu khác nhau — mô phỏng kiểu tick theo quy mô như các
// mạng xã hội lớn (demo, KHÔNG phải xác thực danh tính thật). Chỉ trả tier + label ở đây, màu sắc/
// icon cụ thể do frontend tự map theo `tier` (Tailwind cần thấy class name literal trong file
// frontend mới build vào CSS, để màu ở backend sẽ bị purge mất khi build).
const BADGE_TIERS = [
  { min: 1_000_000, tier: 5, label: 'Kim cương' },
  { min: 100_000, tier: 4, label: 'Bạch kim' },
  { min: 10_000, tier: 3, label: 'Vàng' },
  { min: 1_000, tier: 2, label: 'Bạc' },
  { min: 100, tier: 1, label: 'Đồng' },
]

export function getBadgeTier(followerCount) {
  return BADGE_TIERS.find((t) => followerCount >= t.min) || null
}

export async function getFollowerCount(userId) {
  const { rows } = await query(
    `SELECT (SELECT COUNT(*)::int FROM user_follows WHERE followed_id=$1)
       + COALESCE((SELECT follower_boost FROM users WHERE id=$1), 0) AS c`,
    [userId],
  )
  return rows[0].c
}

export async function getFollowingCount(userId) {
  const { rows } = await query('SELECT COUNT(*)::int AS c FROM user_follows WHERE follower_id=$1', [userId])
  return rows[0].c
}

// Danh sách tên người đang theo dõi userId — chỉ follower THẬT (bảng user_follows), không tính
// follower_boost ảo (vốn chỉ là 1 con số cộng thêm, không có danh tính cụ thể để liệt kê).
export async function listFollowers(userId) {
  const { rows } = await query(
    `SELECT u.id, u.full_name FROM user_follows f
     JOIN users u ON u.id = f.follower_id
     WHERE f.followed_id = $1
     ORDER BY f.created_at DESC`,
    [userId],
  )
  return rows.map((r) => ({ id: r.id, fullName: r.full_name || 'Người dùng HEALTHY SKIN' }))
}

export async function isFollowing(followerId, followedId) {
  const { rows } = await query(
    'SELECT 1 FROM user_follows WHERE follower_id=$1 AND followed_id=$2', [followerId, followedId],
  )
  return rows.length > 0
}

export async function toggleFollow(followerId, followedId) {
  if (Number(followerId) === Number(followedId)) {
    throw new Error('Không thể tự theo dõi chính mình.')
  }
  const already = await isFollowing(followerId, followedId)
  if (already) {
    await query('DELETE FROM user_follows WHERE follower_id=$1 AND followed_id=$2', [followerId, followedId])
  } else {
    await query('INSERT INTO user_follows (follower_id, followed_id) VALUES ($1,$2)', [followerId, followedId])
  }
  const followerCount = await getFollowerCount(followedId)
  return { following: !already, followerCount, badgeTier: getBadgeTier(followerCount) }
}

export async function getPublicProfile(userId, viewerId) {
  const { rows } = await query('SELECT id, full_name, social_link, avatar_url FROM users WHERE id=$1', [userId])
  const user = rows[0]
  if (!user) return null

  const followerCount = await getFollowerCount(userId)
  const followingCount = await getFollowingCount(userId)
  const followingByMe = viewerId ? await isFollowing(viewerId, userId) : false

  return {
    id: user.id,
    fullName: user.full_name || 'Người dùng HEALTHY SKIN',
    socialLink: user.social_link || null,
    avatarUrl: user.avatar_url || null,
    followerCount,
    followingCount,
    badgeTier: getBadgeTier(followerCount),
    followingByMe,
  }
}
