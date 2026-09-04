import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlayIcon, SparklesIcon, HeartIcon, UploadIcon } from '../components/Icons'
import { MOTIVATION_CATEGORIES } from '../data/motivationContent'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { formatDate, formatCompactNumber } from '../lib/format'
import { Lightbox, CommentSection } from './WebsiteReviews'

// Video tự tải lên được backend trả về dạng đường dẫn tương đối ("/uploads/motivation_videos/...").
// Trình duyệt cần URL tuyệt đối trỏ đúng cổng backend (Vite dev proxy chỉ xử lý /api và /ws, không
// xử lý /uploads), cùng cách WebsiteReviews.jsx đang suy ra backendHost từ VITE_API_BASE_URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const BACKEND_HOST = API_BASE_URL.replace(/\/api\/?$/, '')

// Ảnh/video tự tải lên giờ lưu Cloudinary nên path đã là URL tuyệt đối (https://res.cloudinary.com/...)
//, chỉ ghép thêm BACKEND_HOST cho đường dẫn tương đối kiểu cũ "/uploads/..." (dữ liệu cũ trước khi
// chuyển sang Cloudinary), không được ghép cho URL đã tuyệt đối.
export function toFileUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${BACKEND_HOST}${path}`
}

// Huy hiệu theo số người theo dõi (xem followService.getBadgeTier ở backend), chỉ trả tier số +
// nhãn từ server, hình dáng/màu map ở đây vì Tailwind cần thấy đúng tên class trong file frontend
// mới giữ lại lúc build, không thể truyền class name từ backend. Mỗi cấp 1 KIỂU icon riêng (không
// chỉ đổi màu 1 icon), càng lên cao càng chi tiết/"xịn" hơn: check trơn -> check viền đậm -> sao
// khía cạnh (kiểu tick mạng xã hội) -> khiên -> vương miện.
function BadgeTier1Icon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BadgeTier2Icon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BadgeTier3Icon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 2l2.2 2.3 3.2-.7.8 3.2 3 1.3-1.1 3 1.1 3-3 1.3-.8 3.2-3.2-.7L12 22l-2.2-2.1-3.2.7-.8-3.2-3-1.3 1.1-3-1.1-3 3-1.3.8-3.2 3.2.7L12 2z" />
      <path d="M8.5 12.2l2.3 2.3 4.5-4.5" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BadgeTier4Icon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 2l7 3.2v5.3c0 5-3 8.7-7 11.5-4-2.8-7-6.5-7-11.5V5.2L12 2z" />
      <path d="M8.3 12.2l2.4 2.4 5-5" stroke="white" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BadgeTier5Icon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M3.5 8.5L8 12l4-7 4 7 4.5-3.5L19 18H5L3.5 8.5z" />
      <circle cx="12" cy="5" r="1.4" fill="currentColor" />
      <circle cx="3.5" cy="8.5" r="1.4" fill="currentColor" />
      <circle cx="20.5" cy="8.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

const BADGE_TIER_ICONS = {
  1: BadgeTier1Icon,
  2: BadgeTier2Icon,
  3: BadgeTier3Icon,
  4: BadgeTier4Icon,
  5: BadgeTier5Icon,
}

const BADGE_TIER_COLORS = {
  1: 'text-orange-700',
  2: 'text-gray-400',
  3: 'text-amber-500',
  4: 'text-cyan-500',
  5: 'text-sky-400',
}

export function BadgeTierIcon({ badgeTier, className = 'h-4 w-4' }) {
  if (!badgeTier) return null
  const Icon = BADGE_TIER_ICONS[badgeTier.tier] || BadgeTier1Icon
  return (
    <Icon
      className={`${className} ${BADGE_TIER_COLORS[badgeTier.tier] || BADGE_TIER_COLORS[1]} shrink-0`}
      aria-label={`Huy hiệu ${badgeTier.label}`}
    />
  )
}

const THEME = {
  emerald: {
    badge: 'bg-[#6F9D8D]/15 text-[#2563eb] border border-[#6F9D8D]/30',
    pillBg: 'bg-[#6F9D8D]/10',
    accent: '#6F9D8D',
    gradient: 'from-[#172554] via-[#2563eb] to-[#60a5fa]',
  },
  amber: {
    badge: 'bg-[#D8B27A]/15 text-[#A87A45] border border-[#D8B27A]/30',
    pillBg: 'bg-[#D8B27A]/10',
    accent: '#D8B27A',
    gradient: 'from-[#172554] via-[#A87A45] to-[#D8B27A]',
  },
  teal: {
    badge: 'bg-[#60a5fa]/15 text-[#2563eb] border border-[#2563eb]/30',
    pillBg: 'bg-[#60a5fa]/10',
    accent: '#60a5fa',
    gradient: 'from-[#172554] via-[#6F9D8D] to-[#60a5fa]',
  },
}

function ThumbnailArtwork({ themeKey, title }) {
  const theme = THEME[themeKey] || THEME.emerald

  return (
    <div
      role="img"
      aria-label={`Ảnh minh hoạ cho video ${title}`}
      className={`relative h-full w-full overflow-hidden bg-gradient-to-tr ${theme.gradient} flex items-center justify-center`}
    >
      {/* Ambient Lighting Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#60a5fa]/30 blur-xl animate-pulse" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#BFD8CF]/30 blur-xl" />

      {/* Procedural AI Skincare Graphic */}
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 shadow-2xl">
        <div
          className="h-10 w-10 rounded-2xl opacity-80 transition-transform duration-700 group-hover:scale-125"
          style={{ backgroundColor: theme.accent }}
        />
      </div>
    </div>
  )
}

function PostComposer({ onCreated, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState('link')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      if (mode === 'link') {
        formData.append('videoUrl', videoUrl)
      } else if (videoFile) {
        formData.append('video', videoFile)
      }
      const created = await apiClient.post('/motivation/posts', formData, { auth: true, isFormData: true })
      onCreated(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-[#dbeafe] bg-white p-6 sm:p-7 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#172554]">Đăng ảnh/video truyền động lực</h3>
        <button type="button" onClick={onClose} className="text-xs font-bold text-[#64748B] hover:text-[#2563eb]">
          Đóng
        </button>
      </div>

      <input
        type="text"
        required
        placeholder="Tiêu đề video"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
      />
      <textarea
        rows={2}
        placeholder="Mô tả ngắn (không bắt buộc)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
      />

      <div className="flex gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`rounded-full px-4 py-2 transition ${mode === 'link' ? 'bg-[#2563eb] text-white' : 'bg-[#eff6ff] text-[#64748B]'}`}
        >
          Dán link video
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`rounded-full px-4 py-2 transition ${mode === 'file' ? 'bg-[#2563eb] text-white' : 'bg-[#eff6ff] text-[#64748B]'}`}
        >
          Tải file ảnh/video lên
        </button>
      </div>

      {mode === 'link' ? (
        <input
          type="url"
          required
          placeholder="https://youtube.com/..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#2563eb]/40 bg-[#eff6ff] px-4 py-3 text-sm font-semibold text-[#2563eb] hover:border-[#2563eb]">
          <UploadIcon className="h-4 w-4" />
          {videoFile ? videoFile.name : 'Chọn file ảnh hoặc video (tối đa 60MB)'}
          <input
            type="file"
            accept="video/*,image/*"
            required
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </label>
      )}

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#172554] disabled:opacity-60"
      >
        {submitting ? 'Đang đăng...' : 'Đăng bài'}
      </button>
    </motion.form>
  )
}

// Menu "..." dùng cho bài đăng, cùng kiểu với EntryMenu ở WebsiteReviews.jsx nhưng định nghĩa riêng
// ở đây để tránh vòng lặp import (WebsiteReviews đã import BadgeTierIcon từ file này).
function PostMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tuỳ chọn bài đăng"
        className="px-1 text-sm font-bold leading-none text-[#64748B] hover:text-[#172554]"
      >
        ⋯
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[100px] overflow-hidden rounded-lg border border-[#dbeafe] bg-white shadow-md">
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit() }}
              className="block w-full whitespace-nowrap px-3 py-1.5 text-left text-xs font-bold text-[#172554] hover:bg-[#eff6ff]"
            >
              Sửa
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete() }}
              className="block w-full whitespace-nowrap px-3 py-1.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50"
            >
              Xoá
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Sửa tại chỗ chỉ tiêu đề/mô tả, đổi ảnh/video thì phải xoá đăng lại bài mới (xem
// motivationPostService.updatePost).
function PostEditForm({ post, onSaved, onCancel }) {
  const [title, setTitle] = useState(post.title)
  const [description, setDescription] = useState(post.description || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await apiClient.put(`/motivation/posts/${post.id}`, { title: title.trim(), description: description.trim() }, { auth: true })
      onSaved(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-2">
      <input
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
      />
      <textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
      />
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-xl bg-[#2563eb] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-[#dbeafe] px-4 py-1.5 text-xs font-bold text-[#64748B]">
          Huỷ
        </button>
      </div>
    </form>
  )
}

export function CommunityPostCard({ post, currentUserId, onLikeToggle, onDelete, onEdited, onCommentCountChange }) {
  const [viewed, setViewed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  function trackView() {
    if (viewed) return
    setViewed(true)
    apiClient.post(`/motivation/posts/${post.id}/view`, {}, { auth: true }).catch(() => {})
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#dbeafe] bg-white shadow-xs flex flex-col">
      {/* Tên người đăng to + số người theo dõi lên đầu, trước cả media; "..." ở trên cùng bên phải */}
      <div className="flex items-center justify-between gap-2 px-5 pt-4">
        <Link
          to={`/nguoi-dung/${post.userId}`}
          className="inline-flex items-center gap-1.5 font-bold text-[#172554] hover:text-[#2563eb]"
        >
          {post.authorName}
          <BadgeTierIcon badgeTier={post.authorBadgeTier} className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#64748B]">{formatCompactNumber(post.authorFollowerCount)} người theo dõi</span>
          {currentUserId === post.userId && (
            <PostMenu onEdit={() => setEditing(true)} onDelete={() => onDelete(post)} />
          )}
        </div>
      </div>

      <div className="mt-3">
        {post.videoFileUrl ? (
          post.mediaType === 'image' ? (
            <img
              onLoad={trackView}
              onClick={() => setLightbox({ src: toFileUrl(post.videoFileUrl), type: 'image' })}
              className="h-52 w-full cursor-zoom-in bg-[#eff6ff] object-contain"
              src={toFileUrl(post.videoFileUrl)}
              alt={post.title}
            />
          ) : (
            <div className="relative">
              <video
                controls
                onPlay={trackView}
                className="h-52 w-full bg-black object-contain"
                src={toFileUrl(post.videoFileUrl)}
              />
              <button
                type="button"
                onClick={() => setLightbox({ src: toFileUrl(post.videoFileUrl), type: 'video' })}
                aria-label="Xem video phóng to"
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                ⤢
              </button>
            </div>
          )
        ) : (
          <a
            href={post.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackView}
            className="group relative flex h-52 w-full items-center justify-center bg-gradient-to-br from-[#172554] via-[#2563eb] to-[#60a5fa]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#2563eb] shadow-xl transition-transform group-hover:scale-110">
              <PlayIcon className="h-6 w-6 translate-x-0.5" />
            </span>
          </a>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-3 space-y-1.5">
        {editing ? (
          <PostEditForm
            post={post}
            onSaved={(updated) => { onEdited(updated); setEditing(false) }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <h4 className="font-bold text-[#172554] leading-snug">{post.title}</h4>
            {post.description && <p className="text-xs text-[#64748B] leading-relaxed">{post.description}</p>}
          </>
        )}

        {/* Tim bên trái, lượt xem chính giữa, ngày đăng sát phải */}
        <div className="mt-auto grid grid-cols-3 items-center pt-3">
          <button
            type="button"
            onClick={() => onLikeToggle(post)}
            disabled={!currentUserId}
            className={`flex items-center gap-1.5 justify-self-start text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              post.likedByMe ? 'text-rose-500' : 'text-[#64748B] hover:text-rose-500'
            }`}
          >
            <HeartIcon className="h-4 w-4" filled={post.likedByMe} />
            {formatCompactNumber(post.likeCount)}
          </button>
          <span className="justify-self-center text-xs text-[#64748B]">{formatCompactNumber(post.viewCount)} lượt xem</span>
          <span className="justify-self-end text-xs text-[#64748B]">{formatDate(post.createdAt)}</span>
        </div>

        <div className="border-t border-[#eff6ff] pt-2">
          <CommentSection
            listPath={`/motivation/posts/${post.id}/comments`}
            mutateBase="/motivation"
            commentCount={post.commentCount || 0}
            onCommentCountChange={(delta) => onCommentCountChange(post.id, delta)}
            onImageClick={(src) => setLightbox({ src, type: 'image' })}
          />
        </div>
      </div>

      <Lightbox media={lightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}

function MotivationPage() {
  useDocumentTitle('Góc truyền động lực')
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [showComposer, setShowComposer] = useState(false)

  function loadPosts() {
    apiClient.get('/motivation/posts', { auth: true }).then(setPosts).catch(() => {})
  }

  useEffect(loadPosts, [user])

  async function handleLikeToggle(post) {
    try {
      const result = await apiClient.post(`/motivation/posts/${post.id}/like`, {}, { auth: true })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likedByMe: result.liked, likeCount: result.likeCount } : p)))
    } catch {
      // im lặng bỏ qua, nút tim không quan trọng tới mức phải chặn UI bằng thông báo lỗi
    }
  }

  async function handleDelete(post) {
    try {
      await apiClient.delete(`/motivation/posts/${post.id}`, { auth: true })
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch {
      // im lặng bỏ qua, tương tự handleLikeToggle
    }
  }

  function handleEdited(updated) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  function handleCommentCountChange(postId, delta) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + delta } : p)))
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#60a5fa]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -left-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -right-20 h-[400px] w-[400px] rounded-full bg-[#60a5fa]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-16">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#dbeafe] bg-[#FCFDFC]/90 p-8 sm:p-14 backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)] text-center space-y-4"
        >

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#172554]">
            Góc Truyền Động Lực
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Video &amp; nội dung ngắn chọn lọc giúp bạn duy trì thói quen chăm sóc da, dinh dưỡng và lối sống lành mạnh mỗi ngày bên cạnh hồ sơ cá nhân.
          </p>
        </motion.div>

        {/* VIDEO TỪ CỘNG ĐỒNG, người dùng tự đăng, tích điểm theo lượt xem/tim */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#172554]">Ảnh/video từ cộng đồng</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Tự đăng ảnh hoặc video của bạn. Lượt xem &amp; lượt tim từ người khác sẽ cộng điểm tích luỹ, dùng đổi voucher ở Kho Voucher.
              </p>
            </div>
            {user && (
              <button
                type="button"
                onClick={() => setShowComposer((v) => !v)}
                className="shrink-0 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#172554]"
              >
                {showComposer ? 'Đóng' : '+ Đăng bài'}
              </button>
            )}
          </div>

          {showComposer && (
            <PostComposer
              onCreated={(created) => {
                setPosts((prev) => [created, ...prev])
                setShowComposer(false)
              }}
              onClose={() => setShowComposer(false)}
            />
          )}

          {posts.length === 0 ? (
            <p className="text-sm text-[#64748B]">Chưa có bài đăng nào từ cộng đồng, hãy là người đăng đầu tiên.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
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

        {/* MOTIVATION CATEGORIES GRID */}
        <div className="space-y-16">
          {MOTIVATION_CATEGORIES.map((category, catIdx) => {
            const theme = THEME[category.color] || THEME.emerald
            return (
              <motion.section
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: catIdx * 0.1 }}
                className="space-y-6"
              >
                {/* FLOATING GLASS PILL CATEGORY HEADER */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold shadow-xs backdrop-blur-md border ${theme.badge}`}>
                    <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: theme.accent }} />
                    {category.label}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#dbeafe]" />
                </div>

                {/* VIDEO CARDS */}
                <div className="grid gap-8 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <motion.a
                      key={item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -6, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="group overflow-hidden rounded-[28px] border border-[#dbeafe] bg-[#FCFDFC] shadow-[0_12px_40px_rgba(47, 169, 140,0.06)] transition-all duration-300 hover:border-[#2563eb] hover:shadow-[0_20px_50px_rgba(47, 169, 140,0.12)] flex flex-col justify-between"
                    >
                      <div>
                        {/* BROWSER-STYLE WINDOW FRAME TOP BAR */}
                        <div className="flex items-center justify-between border-b border-[#dbeafe] bg-[#eff6ff] px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                          </div>
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                            motivation.ai/video
                          </span>
                        </div>

                        {/* MOCKUP THUMBNAIL AREA */}
                        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                          <ThumbnailArtwork themeKey={category.color} title={item.title} />

                          {/* Curated Badge */}
                          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-[#dbeafe] px-3 py-1 text-[11px] font-extrabold text-[#172554] shadow-xs backdrop-blur-md">
                            <SparklesIcon className="h-3 w-3 text-[#2563eb]" />
                            Đề xuất cho bạn
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-md">
                            4:30 MIN
                          </div>

                          {/* Floating Glass Play Button Overlay */}
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#2563eb] shadow-xl border border-white/60 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2563eb] group-hover:text-white">
                              <PlayIcon className="h-7 w-7 translate-x-0.5" />
                            </span>
                          </div>
                        </div>

                        {/* CARD CONTENT */}
                        <div className="p-6 sm:p-7 space-y-2">
                          <h3 className="font-display text-xl font-extrabold text-[#172554] group-hover:text-[#2563eb] transition-colors leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-sm text-[#64748B] leading-relaxed font-normal">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* CARD FOOTER */}
                      <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0 flex items-center justify-between text-xs font-bold text-[#2563eb]">
                        <span className="group-hover:underline">Xem video trên YouTube</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.section>
            )
          })}
        </div>

        <p className="text-center text-xs text-[#64748B] pt-4 font-normal">
          Bấm vào thẻ để mở kết quả tìm kiếm liên quan trên YouTube.
        </p>
      </div>
    </div>
  )
}

export default MotivationPage
