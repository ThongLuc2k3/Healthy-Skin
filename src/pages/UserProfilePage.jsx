import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { formatCompactNumber } from '../lib/format'
import { ArrowLeftIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { CommunityPostCard, BadgeTierIcon } from './MotivationPage'
import { AccountAvatar } from '../components/NavBar'

function UserProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [followBusy, setFollowBusy] = useState(false)

  useDocumentTitle(profile?.fullName || 'Trang cá nhân')

  function load() {
    apiClient
      .get(`/users/${id}`, { auth: true })
      .then((data) => {
        setProfile(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(load, [id])

  async function handleFollowToggle() {
    setFollowBusy(true)
    try {
      const result = await apiClient.post(`/users/${id}/follow`, {}, { auth: true })
      setProfile((prev) => ({ ...prev, followingByMe: result.following, followerCount: result.followerCount, badgeTier: result.badgeTier }))
    } catch {
      // im lặng bỏ qua, không đáng để chặn UI bằng thông báo lỗi cho 1 nút follow
    } finally {
      setFollowBusy(false)
    }
  }

  async function handleLikeToggle(post) {
    try {
      const result = await apiClient.post(`/motivation/posts/${post.id}/like`, {}, { auth: true })
      setProfile((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p.id === post.id ? { ...p, likedByMe: result.liked, likeCount: result.likeCount } : p)),
      }))
    } catch {
      // như trên
    }
  }

  async function handleDelete(post) {
    try {
      await apiClient.delete(`/motivation/posts/${post.id}`, { auth: true })
      setProfile((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== post.id) }))
    } catch {
      // như trên
    }
  }

  function handleEdited(updated) {
    setProfile((prev) => ({ ...prev, posts: prev.posts.map((p) => (p.id === updated.id ? updated : p)) }))
  }

  function handleCommentCountChange(postId, delta) {
    setProfile((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + delta } : p)),
    }))
  }

  if (status === 'loading') {
    return <p className="mx-auto mt-24 text-center text-sm text-[#64748B]">Đang tải...</p>
  }
  if (status === 'error' || !profile) {
    return (
      <div className="mx-auto mt-24 max-w-lg px-4 text-center">
        <p className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700">
          Không tìm thấy người dùng.
        </p>
        <Link to="/motivation" className="mt-4 inline-block text-sm font-bold text-[#2563eb] underline">
          Quay lại Góc truyền động lực
        </Link>
      </div>
    )
  }

  const isOwnProfile = user && Number(user.id) === Number(id)

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[900px] space-y-10">
        <Link to="/motivation" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#2563eb]">
          <ArrowLeftIcon className="h-4 w-4" />
          Góc truyền động lực
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-[28px] border border-[#dbeafe] bg-white p-8 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AccountAvatar fullName={profile.fullName} avatarUrl={profile.avatarUrl} className="h-16 w-16 text-xl" />
              <div>
                <h1 className="flex items-center gap-1.5 font-display text-2xl font-black text-[#172554]">
                  {profile.fullName}
                  <BadgeTierIcon badgeTier={profile.badgeTier} className="h-5 w-5" />
                </h1>
                {profile.badgeTier && (
                  <p className="text-xs font-bold text-[#2563eb]">Huy hiệu {profile.badgeTier.label}</p>
                )}
                {profile.socialLink && (
                  <a
                    href={profile.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-[#2563eb] hover:underline break-all"
                  >
                    {profile.socialLink}
                  </a>
                )}
              </div>
            </div>

            {!isOwnProfile && (
              user ? (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={followBusy}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
                    profile.followingByMe
                      ? 'bg-[#eff6ff] border border-[#dbeafe] text-[#64748B]'
                      : 'bg-[#2563eb] text-white hover:bg-[#172554]'
                  }`}
                >
                  {profile.followingByMe ? 'Đang theo dõi' : '+ Theo dõi'}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="shrink-0 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#172554]"
                >
                  Đăng nhập để theo dõi
                </Link>
              )
            )}
          </div>

          <div className="mt-6 flex gap-6 border-t border-[#eff6ff] pt-5 text-sm">
            <p><span className="font-bold text-[#172554]">{formatCompactNumber(profile.followerCount)}</span> <span className="text-[#64748B]">người theo dõi</span></p>
            <p><span className="font-bold text-[#172554]">{formatCompactNumber(profile.followingCount)}</span> <span className="text-[#64748B]">đang theo dõi</span></p>
          </div>
        </motion.div>

        <div className="space-y-5">
          <h2 className="font-display text-xl font-extrabold text-[#172554]">Ảnh/video đã đăng</h2>
          {profile.posts.length === 0 ? (
            <p className="text-sm text-[#64748B]">Chưa đăng ảnh/video nào.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {profile.posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLikeToggle={handleLikeToggle}
                  onDelete={handleDelete}
                  onEdited={handleEdited}
                  onCommentCountChange={handleCommentCountChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
