import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient, openAuthedFile, fetchAuthedBlobUrl } from '../lib/apiClient'
import { openConsultationSocket } from '../lib/consultationSocket'
import { ArrowLeftIcon, DocumentIcon, CheckCircleIcon, SendIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function ConsultationThread({ bookingId }) {
  const [thread, setThread] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [productNames, setProductNames] = useState({})
  const [imageUrls, setImageUrls] = useState({})

  async function loadThread() {
    try {
      const data = await apiClient.get(`/experts/bookings/${bookingId}/thread`, { auth: true })
      setThread(data)
    } catch {
      // Chưa có thread (chưa đồng ý gửi hồ sơ khi đặt lịch), bỏ qua, không hiện khung chat.
    }
  }

  useEffect(() => {
    loadThread()
    apiClient.get('/sponsored/products').then((products) => {
      setProductNames(Object.fromEntries(products.map((p) => [p.id, p.name])))
    }).catch(() => {})

    // Tin nhắn mới (kể cả tin mình vừa gửi) đến qua WebSocket, không cần polling nữa. Nếu môi
    // trường nào đó chặn WS, socket helper tự rơi về gọi loadThread() mỗi 30s.
    const socket = openConsultationSocket({
      bookingId,
      role: 'user',
      onMessage: (message) => {
        setThread((prev) => (prev ? { ...prev, status: 'active', messages: [...prev.messages, message] } : prev))
      },
      onFallbackPoll: loadThread,
    })
    return () => socket.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  useEffect(() => {
    const imageMessages = thread?.messages?.filter((m) => m.hasImage) || []
    imageMessages.forEach((m) => {
      if (imageUrls[m.id]) return
      fetchAuthedBlobUrl(m.imageUrl).then((url) => {
        setImageUrls((prev) => ({ ...prev, [m.id]: url }))
      }).catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread])

  async function handleSend(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    setError('')
    try {
      // Không cần loadThread() lại, tin nhắn vừa gửi sẽ quay lại qua WebSocket cho chính mình
      // (server broadcast cho cả phòng, kể cả người gửi), tránh hiện trùng lặp.
      await apiClient.post(`/experts/bookings/${bookingId}/thread/messages`, { text: value }, { auth: true })
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!thread) return null

  return (
    <div className="mt-6 border-t border-[#dbeafe] pt-6">
      <p className="text-xs font-mono font-semibold tracking-wider text-[#1d4ed8] uppercase">
        Trò chuyện với chuyên gia
      </p>
      <p className="mt-1.5 text-xs text-[#172554]/60">
        {thread.status === 'pending_review'
          ? 'Chuyên gia đang xem hồ sơ bạn đã gửi, chưa có tin nhắn mới.'
          : 'Tin nhắn cập nhật tức thời.'}
      </p>

      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-xl bg-[#f8fbff] border border-[#dbeafe] p-3">
        {thread.messages.length === 0 && (
          <p className="py-6 text-center text-xs text-[#172554]/50">Chưa có tin nhắn nào.</p>
        )}
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.senderType === 'user'
                  ? 'bg-[#2563eb] text-white font-medium'
                  : 'bg-white border border-[#dbeafe] text-[#172554]'
              }`}
            >
              {m.text && <p className="whitespace-pre-line">{m.text}</p>}
              {m.hasImage && imageUrls[m.id] && (
                <img src={imageUrls[m.id]} alt="Ảnh chuyên gia gửi" className="mt-2 max-h-56 rounded-lg" />
              )}
              {m.recommendedProductId && (
                <p className="mt-2 rounded-lg bg-[#fff7ed] border border-[#f97316]/30 px-2.5 py-1.5 text-[11px] font-semibold text-[#ea580c]">
                  Gợi ý sản phẩm: {productNames[m.recommendedProductId] || m.recommendedProductId}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhắn tin cho chuyên gia..."
          className="flex-1 rounded-xl bg-white border border-[#dbeafe] px-3 py-2 text-sm text-[#172554] placeholder-[#172554]/35 focus:border-[#2563eb] focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-white transition hover:bg-[#1d4ed8] disabled:opacity-50"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs font-medium text-rose-500">{error}</p>
      )}
    </div>
  )
}

function BookingDetailPage() {
  useDocumentTitle('Chi tiết lịch hẹn')
  const { id } = useParams()
  const { user, ready } = useAuth()

  const [booking, setBooking] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    apiClient
      .get(`/experts/bookings/${id}`, { auth: true })
      .then((data) => {
        setBooking(data)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [id, user])

  async function handleUploadReport(file) {
    setUploading(true)
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('report', file)
      const report = await apiClient.post('/profile/expert-report', formData, { auth: true, isFormData: true })
      const updated = await apiClient.patch(
        `/experts/bookings/${id}/link-report`,
        { reportId: report.id },
        { auth: true },
      )
      setBooking(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (ready && !user) {
    return (
      <div className="mx-auto mt-12 max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gradient-logo">Cần đăng nhập</h1>
        <Link to="/login" className="mt-6 inline-block rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-[#1d4ed8]">
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#2563eb]">Đang tải lịch hẹn...</p>
      </div>
    )
  }
  if (status === 'error' || !booking) {
    return (
      <div className="mx-auto mt-12 max-w-lg px-4 py-20 text-center">
        <p className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMessage || 'Không tìm thấy lịch hẹn.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-12 max-w-xl px-4 py-12">
      <Link
        to={`/experts/${booking.expert?.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#172554]/60 hover:text-[#2563eb]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {booking.expert?.name}
      </Link>

      <div className="mt-6 rounded-3xl glass-strong border border-[#dbeafe] p-7 shadow-glow-lg">
        <h1 className="text-2xl font-bold text-gradient-logo">Chi tiết lịch hẹn</h1>
        <div className="mt-4 space-y-2 text-sm text-[#172554]/80">
          <p>
            <span className="text-[#172554]/50">Chuyên gia:</span> {booking.expert?.name} ({booking.expert?.specialty})
          </p>
          <p>
            <span className="text-[#172554]/50">Khung giờ:</span> <span className="font-mono text-[#1d4ed8]">{booking.slot}</span>
          </p>
          <p>
            <span className="text-[#172554]/50">Trạng thái:</span>{' '}
            <span className={booking.status === 'completed' ? 'font-semibold text-emerald-600' : 'text-[#1d4ed8]'}>
              {booking.status === 'completed' ? 'Đã hoàn tất tư vấn' : 'Đã đặt lịch'}
            </span>
          </p>
        </div>

        <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
          Chuyên gia sẽ xem hồ sơ bạn đã gửi và trao đổi trực tiếp qua tin nhắn trong khung giờ đã chọn.
        </p>

        <div className="mt-6 border-t border-[#dbeafe] pt-6">
          <p className="text-xs font-mono font-semibold tracking-wider text-[#1d4ed8] uppercase">Kết quả tư vấn</p>

          {booking.consultationReport ? (
            <button
              type="button"
              onClick={() => openAuthedFile(booking.consultationReport.fileUrl)}
              className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {booking.consultationReport.originalName || 'Xem kết quả tư vấn'}
            </button>
          ) : (
            <>
              <p className="mt-2 text-sm text-[#172554]/70 leading-relaxed">
                Sau khi tư vấn xong, tải lên kết quả/báo cáo bác sĩ cung cấp, sẽ được lưu vào hồ sơ mở
                rộng của bạn.
              </p>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white border border-[#dbeafe] px-5 py-2.5 text-sm font-semibold text-[#1d4ed8] hover:border-[#2563eb]">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && handleUploadReport(e.target.files[0])}
                />
                <DocumentIcon className="h-4 w-4 text-[#2563eb]" />
                {uploading ? 'Đang tải lên...' : 'Tải lên kết quả tư vấn'}
              </label>
            </>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700">{errorMessage}</p>
          )}
        </div>

        <ConsultationThread bookingId={booking.id} />
      </div>
    </div>
  )
}

export default BookingDetailPage
