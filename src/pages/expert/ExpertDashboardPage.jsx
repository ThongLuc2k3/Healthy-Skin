import { useEffect, useState } from 'react'
import { expertApiClient, getExpertToken, setExpertToken, onAuthExpired, EXPERT_TOKEN_KEY } from '../../lib/apiClient'
import { openConsultationSocket } from '../../lib/consultationSocket'
import { formatVnd, formatDate } from '../../lib/format'
import { SendIcon, StethoscopeIcon, LogOutIcon } from '../../components/Icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

function ProposalsPanel() {
  const [proposals, setProposals] = useState([])
  const [respondingId, setRespondingId] = useState(null)
  const [error, setError] = useState('')

  function load() {
    expertApiClient.get('/expert-portal/proposals').then(setProposals).catch(() => {})
  }

  useEffect(load, [])

  async function respond(id, accept) {
    setRespondingId(id)
    setError('')
    try {
      await expertApiClient.post(`/expert-portal/proposals/${id}/respond`, { accept })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <div className="rounded-3xl border border-[#dbeafe] bg-white p-6 shadow-xs space-y-4">
      <h2 className="text-sm font-bold text-[#172554]">Đề xuất lịch hẹn từ khách hàng</h2>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      {proposals.length === 0 ? (
        <p className="text-sm text-[#64748B]">Chưa có đề xuất nào đang chờ.</p>
      ) : (
        <ul className="space-y-3">
          {proposals.map((p) => (
            <li key={p.id} className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-4 space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-[#172554]">
                <span>{formatDate(p.proposedDate)} · {p.proposedTime}</span>
                <span className="text-[#2563eb]">{formatVnd(p.proposedFeeVnd)}</span>
              </div>
              {p.noteVi && <p className="text-xs text-[#64748B]">"{p.noteVi}"</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => respond(p.id, true)}
                  disabled={respondingId === p.id}
                  className="flex-1 rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#172554] disabled:opacity-60"
                >
                  Nhận
                </button>
                <button
                  type="button"
                  onClick={() => respond(p.id, false)}
                  disabled={respondingId === p.id}
                  className="flex-1 rounded-lg border border-[#dbeafe] px-3 py-1.5 text-xs font-bold text-[#64748B] hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
                >
                  Từ chối
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ExpertLoginForm({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await expertApiClient.post('/expert-portal/login', { email, password })
      setExpertToken(data.token)
      onLoggedIn(data.expert)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded-3xl border border-[#dbeafe] bg-white p-8 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb]">
          <StethoscopeIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-[#172554]">Cổng Chuyên Gia</h1>
          <p className="text-xs text-[#64748B]">Đăng nhập tài khoản chuyên gia</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email đăng nhập của chuyên gia"
          className="w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#172554] disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="mt-5 rounded-xl bg-[#eff6ff] border border-[#dbeafe] p-3 text-[11px] leading-relaxed text-[#64748B]">
        Mỗi chuyên gia có một tài khoản riêng để xem hồ sơ người dùng đã gửi và trao đổi qua tin nhắn với người đặt lịch.
      </p>
    </div>
  )
}

function ThreadPanel({ bookingId, onSent }) {
  const [thread, setThread] = useState(null)
  const [products, setProducts] = useState([])
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [recommendedProductId, setRecommendedProductId] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await expertApiClient.get(`/expert-portal/bookings/${bookingId}/thread`)
      setThread(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
    expertApiClient.get('/sponsored/products?placement=tu_van_chuyen_gia').then(setProducts).catch(() => {})

    const socket = openConsultationSocket({
      bookingId,
      role: 'expert',
      onMessage: (message) => {
        setThread((prev) => (prev ? { ...prev, status: 'active', messages: [...prev.messages, message] } : prev))
      },
      onFallbackPoll: load,
    })
    return () => socket.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() && !imageFile) return
    setSending(true)
    setError('')
    try {
      const formData = new FormData()
      if (text.trim()) formData.append('text', text.trim())
      if (recommendedProductId) formData.append('recommendedProductId', recommendedProductId)
      if (imageFile) formData.append('image', imageFile)
      await expertApiClient.post(`/expert-portal/bookings/${bookingId}/thread/messages`, formData, {
        isFormData: true,
      })
      setText('')
      setImageFile(null)
      setRecommendedProductId('')
      // Không cần load() lại, tin nhắn vừa gửi quay lại qua WebSocket. onSent chỉ để cập nhật
      // trạng thái (pending_review -> đang trao đổi) ở danh sách lịch hẹn bên trái.
      onSent?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!thread) return <p className="text-sm text-[#64748B]">Đang tải cuộc trò chuyện...</p>

  const profile = thread.profileSnapshot

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Hồ sơ cá nhân người dùng đã gửi</p>
        <div className="mt-2 grid gap-1 text-xs text-[#172554] sm:grid-cols-2">
          <p><span className="text-[#64748B]">Loại da:</span> {profile?.skinType || 'chưa khai báo'}</p>
          <p><span className="text-[#64748B]">Mục tiêu:</span> {(profile?.goals || []).join(', ') || 'không có'}</p>
          <p><span className="text-[#64748B]">Dị ứng:</span> {(profile?.allergies || []).join(', ') || 'không có'}</p>
          <p><span className="text-[#64748B]">Bệnh lý nền:</span> {(profile?.conditions || []).join(', ') || 'không có'}</p>
        </div>
      </div>

      <div className="max-h-72 space-y-2.5 overflow-y-auto rounded-2xl border border-[#dbeafe] bg-white p-3">
        {thread.messages.length === 0 && (
          <p className="py-6 text-center text-xs text-[#64748B]">Chưa có tin nhắn nào.</p>
        )}
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderType === 'expert' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.senderType === 'expert' ? 'bg-[#2563eb] text-white' : 'bg-[#eff6ff] border border-[#dbeafe] text-[#172554]'
              }`}
            >
              {m.text && <p className="whitespace-pre-line">{m.text}</p>}
              {m.hasImage && <p className="mt-1 text-[11px] italic opacity-80">[đã gửi 1 ảnh]</p>}
              {m.recommendedProductId && (
                <p className="mt-1 text-[11px] font-semibold opacity-90">
                  Gợi ý sản phẩm liên kết: {products.find((p) => p.id === m.recommendedProductId)?.name || m.recommendedProductId}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="space-y-2.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập nội dung tư vấn..."
          rows={2}
          className="w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3 py-2 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={recommendedProductId}
            onChange={(e) => setRecommendedProductId(e.target.value)}
            className="rounded-lg border border-[#dbeafe] bg-white px-2.5 py-1.5 text-xs text-[#172554]"
          >
            <option value="">Không gợi ý sản phẩm</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <label className="cursor-pointer rounded-lg border border-[#dbeafe] bg-white px-2.5 py-1.5 text-xs text-[#172554] hover:border-[#2563eb]">
            {imageFile ? imageFile.name.slice(0, 20) : 'Đính kèm ảnh'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={sending || (!text.trim() && !imageFile)}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#172554] disabled:opacity-60"
          >
            <SendIcon className="h-3.5 w-3.5" />
            {sending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </form>
    </div>
  )
}

function ExpertDashboardPage() {
  useDocumentTitle('Cổng Chuyên Gia')
  const [expert, setExpert] = useState(null)
  const [loggedIn, setLoggedIn] = useState(Boolean(getExpertToken()))
  const [bookings, setBookings] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  async function loadBookings() {
    try {
      const data = await expertApiClient.get('/expert-portal/bookings')
      setBookings(data)
    } catch {
      // Lỗi mất kết nối/timeout không có nghĩa token đã hỏng, onAuthExpired (dưới) đã tự lo việc
      // đăng xuất khi backend thật sự trả 401, không cần tự làm lại ở đây.
    }
  }

  useEffect(() => {
    if (loggedIn) loadBookings()
  }, [loggedIn])

  function handleLogout() {
    setExpertToken(null)
    setLoggedIn(false)
    setBookings([])
    setSelectedBookingId(null)
  }

  useEffect(() => onAuthExpired(EXPERT_TOKEN_KEY, handleLogout), [])

  if (!loggedIn) {
    return (
      <ExpertLoginForm
        onLoggedIn={(e) => {
          setExpert(e)
          setLoggedIn(true)
        }}
      />
    )
  }

  return (
    <div className="mx-auto mt-12 max-w-[1000px] px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172554]">Cổng Chuyên Gia</h1>
          <p className="text-sm text-[#64748B]">{expert?.name || 'Chuyên gia'}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-xl border border-[#dbeafe] px-3.5 py-2 text-xs font-bold text-[#64748B] hover:text-rose-600 hover:border-rose-300"
        >
          <LogOutIcon className="h-3.5 w-3.5" />
          Đăng xuất
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <ProposalsPanel />
          <div className="space-y-2">
            {bookings.length === 0 && (
              <p className="text-sm text-[#64748B]">Chưa có lịch hẹn nào.</p>
            )}
            {bookings.map((b) => (
              <button
                key={b.bookingId}
                type="button"
                onClick={() => setSelectedBookingId(b.bookingId)}
                className={`block w-full rounded-xl border px-4 py-3 text-left text-xs font-semibold transition ${
                  selectedBookingId === b.bookingId
                    ? 'border-[#2563eb] bg-[#2563eb]/10 text-[#2563eb]'
                    : 'border-[#dbeafe] bg-white text-[#172554] hover:border-[#2563eb]/50'
                }`}
              >
                <p>Khung giờ: {b.slot}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider opacity-70">
                  {b.status === 'pending_review' ? 'Chưa xem hồ sơ' : 'Đang trao đổi'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#dbeafe] bg-white p-6 shadow-xs">
          {selectedBookingId ? (
            <ThreadPanel bookingId={selectedBookingId} onSent={loadBookings} />
          ) : (
            <p className="text-sm text-[#64748B]">Chọn một lịch hẹn bên trái để xem hồ sơ và nhắn tin.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpertDashboardPage
