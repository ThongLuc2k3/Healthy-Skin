import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { formatDate, formatCompactNumber } from '../lib/format'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { BadgeTierIcon, toFileUrl } from './MotivationPage'

// Bấm vào ảnh HOẶC video (bất kỳ đâu: đánh giá, bình luận, trả lời, bài đăng Góc truyền động lực)
// đều mở lên phóng to ở đây thay vì hiện cỡ nhỏ cố định, type="video" thì phát video có điều khiển,
// mặc định type="image" hiện ảnh tĩnh.
export function Lightbox({ media, onClose }) {
  if (!media?.src) return null
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {media.type === 'video' ? (
        <video
          src={media.src}
          controls
          autoPlay
          className="max-h-[92vh] max-w-[92vw] w-auto h-auto rounded-xl object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={media.src}
          alt=""
          className="max-h-[92vh] max-w-[92vw] w-auto h-auto rounded-xl object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#172554] text-lg font-bold"
      >
        ✕
      </button>
    </div>
  )
}

export function ReactionButtons({ liked, disliked, likeCount, dislikeCount, onReact, disabled }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onReact('like')}
        className={`flex items-center gap-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          liked ? 'text-[#2563eb]' : 'text-[#64748B] hover:text-[#2563eb]'
        }`}
      >
        👍 {formatCompactNumber(likeCount)}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onReact('dislike')}
        className={`flex items-center gap-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          disliked ? 'text-rose-600' : 'text-[#64748B] hover:text-rose-600'
        }`}
      >
        👎 {formatCompactNumber(dislikeCount)}
      </button>
    </div>
  )
}

// Lưới thumbnail cho nhiều ảnh, bấm 1 ảnh bất kỳ để phóng to qua Lightbox.
export function ImageGallery({ paths, onImageClick, thumbSize = 'h-20 w-20' }) {
  if (!paths || paths.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {paths.map((p, i) => (
        <img
          key={i}
          src={toFileUrl(p)}
          alt=""
          onClick={() => onImageClick(toFileUrl(p))}
          className={`${thumbSize} rounded-lg border border-[#dbeafe] object-cover cursor-zoom-in`}
        />
      ))}
    </div>
  )
}

// Ảnh của chính đánh giá (khác ảnh đính kèm trong bình luận, nhỏ hơn), 1 ảnh thì phóng to hết cỡ,
// nhiều ảnh thì chia lưới 2 cột, đặt song song 1|1 với tiêu đề/nội dung thay vì để lẻ 1 góc gây
// trống nhiều khoảng trắng bên cạnh.
function ReviewImageDisplay({ paths, onImageClick }) {
  if (!paths || paths.length === 0) return null
  if (paths.length === 1) {
    return (
      <img
        src={toFileUrl(paths[0])}
        alt=""
        onClick={() => onImageClick(toFileUrl(paths[0]))}
        className="h-56 w-full rounded-xl border border-[#dbeafe] object-cover cursor-zoom-in sm:h-64"
      />
    )
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {paths.map((p, i) => (
        <img
          key={i}
          src={toFileUrl(p)}
          alt=""
          onClick={() => onImageClick(toFileUrl(p))}
          className="h-28 w-full rounded-xl border border-[#dbeafe] object-cover cursor-zoom-in sm:h-32"
        />
      ))}
    </div>
  )
}

function MultiImagePicker({ onChange }) {
  return (
    <label className="flex shrink-0 cursor-pointer items-center rounded-xl border border-[#dbeafe] px-3 text-xs font-bold text-[#64748B] hover:border-[#2563eb] hover:text-[#2563eb]">
      🖼️
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onChange(Array.from(e.target.files || []))}
      />
    </label>
  )
}

// onOutsideClickEmpty: bấm ra ngoài khung khi CHƯA gõ gì/chưa chọn ảnh thì tự đóng lại (dùng cho
// khung trả lời bật/tắt qua nút "Trả lời"), nếu đã gõ dở thì giữ nguyên để không mất nội dung.
function CommentComposer({ onSubmit, placeholder, autoFocus, onOutsideClickEmpty }) {
  const [text, setText] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef(null)

  useEffect(() => {
    if (!onOutsideClickEmpty) return undefined
    function handleClickOutside(e) {
      if (!text.trim() && imageFiles.length === 0 && formRef.current && !formRef.current.contains(e.target)) {
        onOutsideClickEmpty()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onOutsideClickEmpty, text, imageFiles])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() && imageFiles.length === 0) return
    setSending(true)
    setError('')
    try {
      await onSubmit({ content: text.trim(), imageFiles })
      setText('')
      setImageFiles([])
    } catch (err) {
      console.error('[CommentComposer] Gửi thất bại:', err)
      setError(err.message || 'Không gửi được, vui lòng thử lại.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSend} className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-[#dbeafe] px-3 py-1.5 text-sm focus:outline-none focus:border-[#2563eb]"
        />
        <MultiImagePicker onChange={setImageFiles} />
        <button
          type="submit"
          disabled={sending || (!text.trim() && imageFiles.length === 0)}
          className="shrink-0 rounded-xl bg-[#2563eb] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          Gửi
        </button>
      </div>
      {imageFiles.length > 0 && <p className="text-[11px] text-[#64748B]">Đính kèm {imageFiles.length} ảnh</p>}
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </form>
  )
}

// Menu "..." dùng chung cho bình luận/trả lời/đánh giá/bài đăng, Sửa mở form sửa tại chỗ, Xoá xoá luôn.
export function EntryMenu({ onEdit, onDelete, deleteLabel = 'Xoá' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tuỳ chọn"
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
              {deleteLabel}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Form sửa tại chỗ cho 1 bình luận/trả lời, chỉ có nội dung + ảnh (không có tiêu đề/số sao, khác
// với sửa đánh giá). mutateBase quyết định gọi API /reviews/comments/:id hay /motivation/comments/:id.
function CommentEditForm({ entry, mutateBase, onSaved, onCancel }) {
  const [text, setText] = useState(entry.content || '')
  const [imageFiles, setImageFiles] = useState([])
  const [removeImages, setRemoveImages] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('content', text.trim())
      imageFiles.forEach((f) => formData.append('images', f))
      if (imageFiles.length === 0 && removeImages) formData.append('removeImages', 'true')
      const updated = await apiClient.put(`${mutateBase}/comments/${entry.id}`, formData, { auth: true, isFormData: true })
      onSaved(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-1.5">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-xl border border-[#dbeafe] px-3 py-1.5 text-sm focus:outline-none focus:border-[#2563eb]"
      />
      {entry.imagePaths?.length > 0 && !removeImages && imageFiles.length === 0 && (
        <button type="button" onClick={() => setRemoveImages(true)} className="text-[11px] font-bold text-rose-600 hover:underline">
          Bỏ {entry.imagePaths.length} ảnh hiện tại
        </button>
      )}
      <div className="flex gap-2">
        <MultiImagePicker onChange={setImageFiles} />
        <button type="submit" disabled={saving} className="rounded-xl bg-[#2563eb] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-[#dbeafe] px-4 py-1.5 text-xs font-bold text-[#64748B]">
          Huỷ
        </button>
      </div>
      {imageFiles.length > 0 && <p className="text-[11px] text-[#64748B]">Ảnh mới: {imageFiles.length} ảnh (thay hết ảnh cũ)</p>}
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </form>
  )
}

function CommentItem({ comment, replies, listPath, mutateBase, onReactComment, onReplyAdded, onImageClick, onDeleteComment, onEditComment }) {
  const { user } = useAuth()
  const [showReply, setShowReply] = useState(false)
  const [editingId, setEditingId] = useState(null)

  async function handleReply({ content, imageFiles }) {
    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('parentCommentId', comment.id)
      imageFiles.forEach((f) => formData.append('images', f))
      const created = await apiClient.post(listPath, formData, { auth: true, isFormData: true })
      onReplyAdded(created)
      setShowReply(false)
    } catch (err) {
      console.error('[CommentItem] Gửi trả lời thất bại:', err)
      throw err
    }
  }

  return (
    <div className="rounded-xl bg-[#eff6ff] px-3 py-2 space-y-1.5">
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs font-bold text-[#172554]">{comment.authorName}</p>
        {user?.id === comment.userId && (
          <EntryMenu onEdit={() => setEditingId(comment.id)} onDelete={() => onDeleteComment(comment.id)} />
        )}
      </div>
      {editingId === comment.id ? (
        <CommentEditForm
          entry={comment}
          mutateBase={mutateBase}
          onSaved={(updated) => { onEditComment(updated); setEditingId(null) }}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <>
          {comment.content && <p className="text-sm text-[#172554]">{comment.content}</p>}
          <ImageGallery paths={comment.imagePaths} onImageClick={onImageClick} thumbSize="h-20 w-20" />
        </>
      )}
      <div className="flex items-center gap-4">
        <p className="text-[10px] text-[#64748B]">{formatDate(comment.createdAt)}</p>
        <ReactionButtons
          liked={comment.myReaction === 'like'}
          disliked={comment.myReaction === 'dislike'}
          likeCount={comment.likeCount}
          dislikeCount={comment.dislikeCount}
          disabled={!user}
          onReact={(reaction) => onReactComment(comment.id, reaction)}
        />
        {user && (
          <button type="button" onClick={() => setShowReply((v) => !v)} className="text-[11px] font-bold text-[#64748B] hover:text-[#2563eb]">
            Trả lời
          </button>
        )}
      </div>

      {showReply && (
        <div className="pt-1">
          <CommentComposer onSubmit={handleReply} placeholder="Viết trả lời..." autoFocus onOutsideClickEmpty={() => setShowReply(false)} />
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-4 space-y-2 border-l-2 border-[#dbeafe] pl-3 pt-1">
          {replies.map((r) => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-bold text-[#172554]">{r.authorName}</p>
                {user?.id === r.userId && (
                  <EntryMenu onEdit={() => setEditingId(r.id)} onDelete={() => onDeleteComment(r.id)} />
                )}
              </div>
              {editingId === r.id ? (
                <CommentEditForm
                  entry={r}
                  mutateBase={mutateBase}
                  onSaved={(updated) => { onEditComment(updated); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  {r.content && <p className="text-sm text-[#172554]">{r.content}</p>}
                  <ImageGallery paths={r.imagePaths} onImageClick={onImageClick} thumbSize="h-16 w-16" />
                </>
              )}
              <div className="flex items-center gap-4">
                <p className="text-[10px] text-[#64748B]">{formatDate(r.createdAt)}</p>
                <ReactionButtons
                  liked={r.myReaction === 'like'}
                  disliked={r.myReaction === 'dislike'}
                  likeCount={r.likeCount}
                  dislikeCount={r.dislikeCount}
                  disabled={!user}
                  onReact={(reaction) => onReactComment(r.id, reaction)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Khối bình luận dùng chung cho Diễn đàn (đánh giá) VÀ Góc truyền động lực (bài đăng), listPath là
// URL đầy đủ để GET/POST danh sách bình luận (vd "/reviews/6/comments" hoặc
// "/motivation/posts/2/comments"), mutateBase là tiền tố để sửa/xoá/thích 1 bình luận cụ thể (vd
// "/reviews" hoặc "/motivation", ghép thành "${mutateBase}/comments/:id"). onCommentCountChange chỉ
// nhận đúng số lượng thay đổi (delta), việc biết bài nào là của caller (xem cách gọi ở dưới).
export function CommentSection({ listPath, mutateBase, commentCount, onCommentCountChange, onImageClick }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState(null)
  const [error, setError] = useState('')

  function toggleOpen() {
    setOpen((v) => !v)
    if (!comments) {
      apiClient.get(listPath, { auth: true }).then(setComments).catch(() => setComments([]))
    }
  }

  async function handleNewComment({ content, imageFiles }) {
    setError('')
    try {
      const formData = new FormData()
      formData.append('content', content)
      imageFiles.forEach((f) => formData.append('images', f))
      const created = await apiClient.post(listPath, formData, { auth: true, isFormData: true })
      setComments((prev) => [...(prev || []), created])
      onCommentCountChange(1)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  function handleReplyAdded(created) {
    setComments((prev) => [...(prev || []), created])
    onCommentCountChange(1)
  }

  // Xoá 1 bình luận gốc kéo theo mọi trả lời của nó bị xoá ở DB (ON DELETE CASCADE), dọn lại state
  // cho khớp bằng cách lọc bỏ cả comment lẫn các trả lời có parentCommentId trỏ tới nó.
  async function handleDeleteComment(commentId) {
    setError('')
    try {
      await apiClient.delete(`${mutateBase}/comments/${commentId}`, { auth: true })
      const removedCount = 1 + (comments || []).filter((c) => c.parentCommentId === commentId).length
      setComments((prev) => {
        const toRemove = new Set([commentId, ...(prev || []).filter((c) => c.parentCommentId === commentId).map((c) => c.id)])
        return (prev || []).filter((c) => !toRemove.has(c.id))
      })
      onCommentCountChange(-removedCount)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleEditComment(updated) {
    setComments((prev) => (prev || []).map((c) => (c.id === updated.id
      ? { ...c, content: updated.content, imagePaths: updated.imagePaths }
      : c)))
  }

  async function handleReactComment(commentId, reaction) {
    try {
      const result = await apiClient.post(`${mutateBase}/comments/${commentId}/reaction`, { reaction }, { auth: true })
      setComments((prev) => prev.map((c) => (c.id === commentId
        ? { ...c, myReaction: result.myReaction, likeCount: result.likeCount, dislikeCount: result.dislikeCount }
        : c)))
    } catch (err) {
      setError(err.message)
    }
  }

  const topLevel = (comments || []).filter((c) => !c.parentCommentId)
  const repliesByParent = {}
  for (const c of comments || []) {
    if (c.parentCommentId) {
      repliesByParent[c.parentCommentId] = [...(repliesByParent[c.parentCommentId] || []), c]
    }
  }

  return (
    <div>
      <button type="button" onClick={toggleOpen} className="text-xs font-bold text-[#64748B] hover:text-[#2563eb]">
        💬 {commentCount} bình luận
      </button>

      {open && (
        <div className="mt-3 space-y-2.5 border-t border-[#eff6ff] pt-3">
          {comments === null ? (
            <p className="text-xs text-[#64748B]">Đang tải...</p>
          ) : topLevel.length === 0 ? (
            <p className="text-xs text-[#64748B]">Chưa có bình luận nào.</p>
          ) : (
            topLevel.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                replies={repliesByParent[c.id] || []}
                listPath={listPath}
                mutateBase={mutateBase}
                onReactComment={handleReactComment}
                onReplyAdded={handleReplyAdded}
                onImageClick={onImageClick}
                onDeleteComment={handleDeleteComment}
                onEditComment={handleEditComment}
              />
            ))
          )}

          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

          {user ? (
            <CommentComposer onSubmit={handleNewComment} placeholder="Viết bình luận..." />
          ) : (
            <Link to="/login" className="text-xs font-bold text-[#2563eb] hover:underline">
              Đăng nhập để bình luận
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

// Form sửa tại chỗ cho 1 đánh giá, có tiêu đề/nội dung/số sao/nhiều ảnh, khác CommentEditForm (chỉ
// có nội dung + ảnh) vì đánh giá có thêm 2 trường đó.
function ReviewEditForm({ review, onSaved, onCancel }) {
  const [title, setTitle] = useState(review.title)
  const [content, setContent] = useState(review.content)
  const [rating, setRating] = useState(review.rating)
  const [imageFiles, setImageFiles] = useState([])
  const [removeImages, setRemoveImages] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('content', content.trim())
      formData.append('rating', rating)
      imageFiles.forEach((f) => formData.append('images', f))
      if (imageFiles.length === 0 && removeImages) formData.append('removeImages', 'true')
      const result = await apiClient.put(`/reviews/${review.id}`, formData, { auth: true, isFormData: true })
      onSaved({ title: title.trim(), content: content.trim(), rating, imagePaths: result.imagePaths })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div className="flex gap-1 text-2xl cursor-pointer">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} onClick={() => setRating(star)} className={star <= rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
        ))}
      </div>
      <input
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-[#dbeafe] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
      />
      <textarea
        required
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border border-[#dbeafe] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
      />
      {review.imagePaths?.length > 0 && !removeImages && imageFiles.length === 0 && (
        <button type="button" onClick={() => setRemoveImages(true)} className="text-xs font-bold text-rose-600 hover:underline">
          Bỏ {review.imagePaths.length} ảnh hiện tại
        </button>
      )}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
        className="text-sm text-[#64748B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2563eb]/10 file:text-[#2563eb] hover:file:bg-[#2563eb]/20 cursor-pointer"
      />
      {imageFiles.length > 0 && <p className="text-xs text-[#64748B]">Ảnh mới: {imageFiles.length} ảnh (thay hết ảnh cũ)</p>}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-[#2563eb] hover:bg-[#172554] text-white text-sm font-semibold px-5 py-2 rounded-xl transition disabled:opacity-60">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="border border-[#dbeafe] text-[#64748B] text-sm font-semibold px-5 py-2 rounded-xl">
          Huỷ
        </button>
      </div>
    </form>
  )
}

export default function WebsiteReviews() {
  useDocumentTitle('Đánh giá trải nghiệm')
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [imageFiles, setImageFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [listError, setListError] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const openLightbox = (src) => setLightbox({ src, type: 'image' })
  const [editingReviewId, setEditingReviewId] = useState(null)

  const fetchReviews = useCallback(async () => {
    try {
      const data = await apiClient.get('/reviews', { auth: true })
      setReviews(data.reviews || [])
    } catch (err) {
      setListError(err.message)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  async function handleReactReview(reviewId, reaction) {
    try {
      const result = await apiClient.post(`/reviews/${reviewId}/reaction`, { reaction }, { auth: true })
      setReviews((prev) => prev.map((r) => (r.id === reviewId
        ? { ...r, myReaction: result.myReaction, likeCount: result.likeCount, dislikeCount: result.dislikeCount }
        : r)))
    } catch (err) {
      setListError(err.message)
    }
  }

  function handleCommentCountChange(reviewId, delta) {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, commentCount: r.commentCount + delta } : r)))
  }

  function handleReviewSaved(reviewId, updates) {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...updates } : r)))
    setEditingReviewId(null)
  }

  async function handleDeleteReview(reviewId) {
    setListError('')
    try {
      await apiClient.delete(`/reviews/${reviewId}`, { auth: true })
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch (err) {
      setListError(err.message)
    }
  }

  // Gửi đánh giá mới bằng FormData, tên hiển thị lấy thẳng từ tài khoản, không cần tự gõ mỗi lần.
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('content', content.trim())
      formData.append('rating', rating)
      imageFiles.forEach((f) => formData.append('images', f))

      await apiClient.post('/reviews', formData, { auth: true, isFormData: true })

      setTitle('')
      setContent('')
      setRating(5)
      setImageFiles([])
      setShowForm(false)
      fetchReviews()
    } catch (err) {
      setFormError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pt-28">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172554]">Đánh Giá Trải Nghiệm Web</h1>
          <p className="text-[#64748B] text-sm">Ý kiến của bạn giúp chúng tôi hoàn thiện hơn</p>
        </div>
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#2563eb] hover:bg-[#172554] text-white font-medium px-4 py-2 rounded-xl transition shadow-sm text-sm"
          >
            {showForm ? 'Đóng lại' : '+ Viết nhận xét'}
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-[#2563eb] hover:bg-[#172554] text-white font-medium px-4 py-2 rounded-xl transition shadow-sm text-sm"
          >
            Đăng nhập để viết nhận xét
          </Link>
        )}
      </div>

      {showForm && user && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#dbeafe] rounded-2xl p-5 mb-8 shadow-xs">
          <h3 className="font-bold text-[#172554] mb-3">Gửi nhận xét của bạn</h3>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-[#64748B] mb-1">Số sao</label>
            <div className="flex gap-1 text-2xl cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => setRating(star)} className={star <= rating ? 'text-amber-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <input
              type="text"
              required
              placeholder="Tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#dbeafe] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          <div className="mb-3">
            <textarea
              required
              rows={3}
              placeholder="Chia sẻ chi tiết trải nghiệm..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-[#dbeafe] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#64748B] mb-1">Hình ảnh đính kèm, chọn được nhiều ảnh cùng lúc (không bắt buộc)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              className="text-sm text-[#64748B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2563eb]/10 file:text-[#2563eb] hover:file:bg-[#2563eb]/20 cursor-pointer"
            />
            {imageFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imageFiles.map((f, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#dbeafe]">
                    <img src={URL.createObjectURL(f)} alt="Ảnh xem trước" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label="Bỏ ảnh đã chọn"
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && (
            <p className="mb-3 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#2563eb] hover:bg-[#172554] text-white text-sm font-semibold px-5 py-2 rounded-xl transition disabled:opacity-60"
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      {listError && (
        <p className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">{listError}</p>
      )}

      {reviews.length === 0 ? (
        <p className="text-center text-sm text-[#64748B] py-10">Chưa có đánh giá nào, hãy là người đầu tiên chia sẻ trải nghiệm của bạn.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((item) => (
            <div key={item.id} className="bg-white border border-[#dbeafe] rounded-2xl p-4 shadow-xs space-y-3">
              {/* Tên + huy hiệu + số người theo dõi lên đầu, rồi mới tới số sao, tiêu đề/nội dung, ảnh */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#172554]">{item.author_name}</span>
                  <BadgeTierIcon badgeTier={item.authorBadgeTier} />
                  <span className="text-xs text-[#64748B]">· {formatCompactNumber(item.authorFollowerCount)} người theo dõi</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#64748B]">{formatDate(item.created_at)}</span>
                  {user?.id === item.userId && (
                    <EntryMenu
                      onEdit={() => setEditingReviewId(item.id)}
                      onDelete={() => handleDeleteReview(item.id)}
                      deleteLabel="Xoá đánh giá"
                    />
                  )}
                </div>
              </div>

              {editingReviewId === item.id ? (
                <ReviewEditForm
                  review={item}
                  onSaved={(updates) => handleReviewSaved(item.id, updates)}
                  onCancel={() => setEditingReviewId(null)}
                />
              ) : (
                <>
                  <div className="text-amber-400 text-2xl leading-none">
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>

                  <div className={item.imagePaths?.length ? 'grid gap-4 sm:grid-cols-2 sm:items-start' : ''}>
                    <div>
                      <h4 className="font-bold text-[#172554] text-base">{item.title}</h4>
                      <p className="text-[#172554] text-sm leading-relaxed mt-1">{item.content}</p>
                    </div>
                    <ReviewImageDisplay paths={item.imagePaths} onImageClick={openLightbox} />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between border-t border-[#eff6ff] pt-3">
                <ReactionButtons
                  liked={item.myReaction === 'like'}
                  disliked={item.myReaction === 'dislike'}
                  likeCount={item.likeCount}
                  dislikeCount={item.dislikeCount}
                  disabled={!user}
                  onReact={(reaction) => handleReactReview(item.id, reaction)}
                />
                <CommentSection
                  listPath={`/reviews/${item.id}/comments`}
                  mutateBase="/reviews"
                  commentCount={item.commentCount}
                  onCommentCountChange={(delta) => handleCommentCountChange(item.id, delta)}
                  onImageClick={openLightbox}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Lightbox media={lightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}
