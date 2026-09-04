import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { formatVnd, formatDate } from '../lib/format'
import { StarIcon, StethoscopeIcon, ArrowLeftIcon, SparklesIcon, CalendarIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const PROPOSAL_STATUS_LABEL = {
  pending: 'Đang chờ chuyên gia phản hồi',
  accepted: 'Chuyên gia đã nhận, xác nhận để đặt lịch',
  rejected: 'Chuyên gia đã từ chối',
  confirmed: 'Đã xác nhận thành lịch hẹn',
}

function CertificationRow({ cert }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-[#FCFDFC] border border-[#dbeafe] px-5 py-3.5 shadow-xs transition-all hover:border-[#2563eb]/40">
      <div>
        <span className="font-display text-sm font-bold text-[#172554]">
          {cert.title_vi}
        </span>
        {(cert.license_no || cert.issuing_authority_vi) && (
          <p className="mt-1 text-[11px] text-[#64748B]">
            {cert.license_no && <>Số: <span className="font-mono">{cert.license_no}</span></>}
            {cert.license_no && cert.issuing_authority_vi && ' · '}
            {cert.issuing_authority_vi && <>Cấp bởi {cert.issuing_authority_vi}</>}
          </p>
        )}
      </div>
      {cert.verified ? (
        <span className="rounded-full bg-[#6F9D8D]/15 border border-[#6F9D8D]/30 px-3 py-1 text-xs font-bold text-[#2563eb] shrink-0">
          Đã xác thực y khoa
        </span>
      ) : (
        <span className="rounded-full bg-[#D8B27A]/15 border border-[#D8B27A]/30 px-3 py-1 text-xs font-bold text-[#A87A45] shrink-0">
          Chờ xác thực chứng chỉ
        </span>
      )}
    </li>
  )
}

function ExpertDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [expert, setExpert] = useState(null)
  useDocumentTitle(expert?.name || 'Chuyên gia')
  const [myBookings, setMyBookings] = useState([])
  const [activeBooking, setActiveBooking] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [booking, setBooking] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)

  const [showProposalForm, setShowProposalForm] = useState(false)
  const [proposals, setProposals] = useState([])
  const [proposalDate, setProposalDate] = useState('')
  const [proposalTime, setProposalTime] = useState('')
  const [proposalFee, setProposalFee] = useState('')
  const [proposalNote, setProposalNote] = useState('')
  const [proposalSubmitting, setProposalSubmitting] = useState(false)
  const [proposalError, setProposalError] = useState('')
  const [confirmingId, setConfirmingId] = useState(null)

  useEffect(() => {
    apiClient
      .get(`/experts/${id}`)
      .then((data) => {
        setExpert(data)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [id])

  useEffect(() => {
    if (!user) return
    Promise.all([
      apiClient.get(`/experts/${id}/my-bookings`, { auth: true }),
      apiClient.get('/experts/bookings/active', { auth: true }),
    ]).then(([bookings, currentBooking]) => {
      setMyBookings(bookings)
      setActiveBooking(currentBooking)
    }).catch(() => {})
  }, [id, user])

  function loadProposals() {
    if (!user) return
    apiClient.get(`/experts/${id}/proposals/mine`, { auth: true }).then(setProposals).catch(() => {})
  }

  useEffect(loadProposals, [id, user])

  async function handleSubmitProposal(e) {
    e.preventDefault()
    setProposalSubmitting(true)
    setProposalError('')
    try {
      await apiClient.post(
        `/experts/${id}/proposals`,
        { date: proposalDate, time: proposalTime, feeVnd: Number(proposalFee), note: proposalNote },
        { auth: true },
      )
      setProposalDate('')
      setProposalTime('')
      setProposalFee('')
      setProposalNote('')
      setShowProposalForm(false)
      loadProposals()
    } catch (err) {
      setProposalError(err.message)
    } finally {
      setProposalSubmitting(false)
    }
  }

  async function handleConfirmProposal(proposalId) {
    setConfirmingId(proposalId)
    setProposalError('')
    try {
      const confirmed = await apiClient.post(`/experts/proposals/${proposalId}/confirm`, {}, { auth: true })
      navigate(`/my-bookings/${confirmed.bookingId}/chat`)
    } catch (err) {
      setProposalError(err.message)
      setConfirmingId(null)
    }
  }

  async function handleBook() {
    if (!selectedSlot || !consentGiven) return
    setBooking(true)
    setErrorMessage('')
    try {
      const created = await apiClient.post(
        `/experts/${id}/book`,
        { slot: selectedSlot, consent: true },
        { auth: true },
      )
      navigate(`/my-bookings/${created.id}/chat`)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBooking(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#2563eb]">Đang tải thông tin chuyên gia...</p>
      </div>
    )
  }

  if (status === 'error' || !expert) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff]">
        <div className="mx-auto max-w-lg rounded-[28px] border border-rose-200 bg-rose-50/80 p-8 text-center shadow-xs">
          <p className="text-sm font-bold text-rose-700">
            {errorMessage || 'Không tìm thấy chuyên gia.'}
          </p>
          <Link
            to="/experts"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#172554] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#2563eb]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#60a5fa]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-10">
        {/* BACK BUTTON */}
        <div>
          <Link
            to="/experts"
            className="inline-flex items-center gap-2 rounded-full bg-[#FCFDFC] border border-[#E8ECEE] px-5 py-2 text-xs font-bold text-[#64748B] hover:text-[#2563eb] hover:border-[#2563eb] transition-all shadow-xs"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Danh sách chuyên gia
          </Link>
        </div>

        {/* PROFILE HERO & AI MATCHING SCORE BOX */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC]/90 p-8 sm:p-12 backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)]"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-center">
            {/* Left Doctor Info */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative shrink-0">
                <span className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2563eb] via-[#60a5fa] to-[#6F9D8D] text-white shadow-[0_10px_30px_rgba(47, 169, 140,0.3)]">
                  <StethoscopeIcon className="h-12 w-12" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#2563eb]/20 bg-[#2563eb]/8 px-3.5 py-1 text-xs font-bold text-[#2563eb]">
                  <SparklesIcon className="h-3.5 w-3.5 text-[#2563eb]" />
                  Chuyên Gia Da Liễu / Dinh Dưỡng
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#172554]">
                  {expert.name}
                </h1>

                <p className="text-base font-semibold text-[#2563eb]">
                  {expert.specialty} · {expert.clinic_name}
                </p>

                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Khu vực: {expert.area_vi}
                </p>

                <div className="pt-1 flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    <StarIcon className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                    <span className="font-display text-lg font-black text-[#172554]">
                      {expert.rating_avg.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-[#64748B] font-medium">
                    ({expert.reviews.length} đánh giá từ người dùng)
                  </span>
                </div>
              </div>
            </div>

            {/* Giá tư vấn, minh bạch ngay từ đầu, không phải điểm số AI tự chấm */}
            <div className="rounded-3xl bg-gradient-to-br from-[#2563eb]/10 via-[#FCFDFC] to-[#60a5fa]/10 border border-[#2563eb]/25 p-6 space-y-4 shadow-xs text-center lg:text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563eb]">
                  GIÁ TƯ VẤN
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#60a5fa]/20 text-[#2563eb]">
                  <CalendarIcon className="h-4.5 w-4.5" />
                </span>
              </div>
              <div>
                <p className="font-display text-4xl font-black text-[#172554]">
                  {expert.consultation_fee_vnd
                    ? `${expert.consultation_fee_vnd.toLocaleString('vi-VN')}đ`
                    : 'Liên hệ'}
                </p>
                <p className="mt-1 text-xs font-bold text-[#2563eb]">mỗi buổi tư vấn</p>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Giá tham khảo do chuyên gia niêm yết, xác nhận ngay trong bước đặt lịch bên dưới.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 2-COLUMN DASHBOARD GRID */}
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* LEFT COLUMN: KINH NGHIỆM & CHỨNG CHỈ */}
          <div className="space-y-10">
            {/* KINH NGHIỆM */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(47, 169, 140,0.04)] space-y-4"
            >
              <h2 className="font-display text-xl font-extrabold text-[#172554] flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                Kinh nghiệm &amp; Chuyên môn
              </h2>
              <p className="text-sm leading-relaxed text-[#64748B] font-normal">
                {expert.bio_vi}
              </p>
            </motion.div>

            {/* CHỨNG CHỈ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(47, 169, 140,0.04)] space-y-5"
            >
              <h2 className="font-display text-xl font-extrabold text-[#172554] flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6F9D8D]" />
                Chứng chỉ y khoa
              </h2>
              <ul className="space-y-3">
                {expert.certifications.map((cert, idx) => (
                  <CertificationRow key={idx} cert={cert} />
                ))}
              </ul>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: LỊCH TƯ VẤN & ĐÁNH GIÁ */}
          <div className="space-y-10">
            {/* LỊCH TƯ VẤN (BOOKING PANEL) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(47, 169, 140,0.04)] space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-[#172554] flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#2563eb]" />
                  Lịch tư vấn 1-1
                </h2>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Sau khi đặt lịch, chuyên gia sẽ xem hồ sơ bạn gửi và trao đổi trực tiếp qua tin nhắn trong khung giờ đã chọn.
              </p>

              <div className="flex flex-wrap gap-3">
                {expert.available_slots.map((slot) => {
                  const isSelected = selectedSlot === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2563eb] text-white shadow-md ring-2 ring-[#60a5fa]'
                          : 'bg-[#eff6ff] border border-[#E8ECEE] text-[#172554] hover:border-[#2563eb]'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>

              <div>
                {user ? (
                  <>
                    {activeBooking && (
                      <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
                        <p className="text-xs font-bold text-[#172554]">Bạn đang có lịch với {activeBooking.expert?.name} vào {activeBooking.slot}.</p>
                        <Link to={`/my-bookings/${activeBooking.id}/chat`} className="mt-2 inline-flex text-xs font-bold text-[#2563eb] underline">
                          Vào phòng chat hiện tại
                        </Link>
                      </div>
                    )}
                    <label className="mb-4 flex items-start gap-2.5 text-xs leading-relaxed text-[#172554] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#2563eb]"
                      />
                      <span>
                        Tôi đồng ý gửi <strong>Hồ sơ cá nhân</strong> (loại da, dị ứng, bệnh lý nền, mục tiêu) cho chuyên gia này xem trước khi tư vấn.
                      </span>
                    </label>
                    <motion.button
                      type="button"
                      disabled={!selectedSlot || !consentGiven || booking || Boolean(activeBooking)}
                      onClick={handleBook}
                      whileHover={
                        !selectedSlot || !consentGiven || booking || activeBooking
                          ? {}
                          : { backgroundPosition: 'right center' }
                      }
                      whileTap={{ scale: !selectedSlot || !consentGiven || booking || activeBooking ? 1 : 0.97 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full rounded-2xl px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_8px_25px_rgba(112, 196, 175,0.35)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer overflow-hidden"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, #2563eb 0%, #60a5fa 51%, #2563eb 100%)',
                      backgroundSize: '200% auto',
                      transition: '0.5s',
                    }}
                    >
                      {booking ? 'Đang đặt lịch...' : activeBooking ? 'Bạn đã có lịch đang hoạt động' : 'Đặt lịch tư vấn'}
                    </motion.button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center rounded-2xl bg-[#2563eb] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#172554]"
                  >
                    Đăng nhập để đặt lịch
                  </Link>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 text-center">
                  {errorMessage}
                </div>
              )}

              {myBookings.length > 0 && (
                <div className="pt-6 border-t border-[#E8ECEE] space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                    Lịch hẹn của bạn với chuyên gia này
                  </p>
                  <ul className="space-y-2">
                    {myBookings.map((b) => (
                      <li key={b.id}>
                        <Link
                          to={`/my-bookings/${b.id}`}
                          className="flex items-center justify-between rounded-xl bg-[#eff6ff] border border-[#E8ECEE] px-4 py-3 text-xs font-bold text-[#172554] hover:border-[#2563eb] transition-colors"
                        >
                          <span>Khung giờ: {b.slot}</span>
                          <span className={b.status === 'completed' ? 'text-[#2563eb]' : 'text-[#64748B]'}>
                            {b.status === 'completed' ? 'Đã hoàn tất' : 'Đã đặt lịch'}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* ĐỀ XUẤT GIÁ/GIỜ KHÁC */}
            {user && !activeBooking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(47, 169, 140,0.04)] space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-extrabold text-[#172554]">
                    Đề xuất ngày/giờ/giá khác
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowProposalForm((v) => !v)}
                    className="text-xs font-bold text-[#2563eb] hover:underline"
                  >
                    {showProposalForm ? 'Đóng' : 'Gửi đề xuất'}
                  </button>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Không hợp khung giờ hoặc giá niêm yết? Tự đề xuất ngày, giờ và mức phí bạn muốn, gửi cho chuyên gia này xem có nhận không.
                </p>

                {showProposalForm && (
                  <form onSubmit={handleSubmitProposal} className="space-y-3 rounded-2xl bg-[#eff6ff] border border-[#dbeafe] p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="date"
                        required
                        value={proposalDate}
                        onChange={(e) => setProposalDate(e.target.value)}
                        className="w-full rounded-xl border border-[#dbeafe] bg-white px-3 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Khung giờ, VD: 19:00 - 20:00"
                        value={proposalTime}
                        onChange={(e) => setProposalTime(e.target.value)}
                        className="w-full rounded-xl border border-[#dbeafe] bg-white px-3 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Mức phí đề xuất (VNĐ)"
                      value={proposalFee}
                      onChange={(e) => setProposalFee(e.target.value)}
                      className="w-full rounded-xl border border-[#dbeafe] bg-white px-3 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      placeholder="Ghi chú thêm (không bắt buộc)"
                      value={proposalNote}
                      onChange={(e) => setProposalNote(e.target.value)}
                      className="w-full rounded-xl border border-[#dbeafe] bg-white px-3 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
                    />
                    {proposalError && <p className="text-xs font-medium text-rose-600">{proposalError}</p>}
                    <button
                      type="submit"
                      disabled={proposalSubmitting}
                      className="w-full rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#172554] disabled:opacity-60"
                    >
                      {proposalSubmitting ? 'Đang gửi...' : 'Gửi đề xuất'}
                    </button>
                  </form>
                )}

                {proposals.length > 0 && (
                  <ul className="space-y-2.5 pt-2 border-t border-[#E8ECEE]">
                    {proposals.map((p) => (
                      <li key={p.id} className="rounded-xl bg-[#eff6ff] border border-[#dbeafe] p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#172554]">
                          <span>{formatDate(p.proposedDate)} · {p.proposedTime}</span>
                          <span className="text-[#2563eb]">{formatVnd(p.proposedFeeVnd)}</span>
                        </div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                          {PROPOSAL_STATUS_LABEL[p.status] || p.status}
                        </p>
                        {p.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmProposal(p.id)}
                            disabled={confirmingId === p.id}
                            className="mt-1 w-full rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#172554] disabled:opacity-60"
                          >
                            {confirmingId === p.id ? 'Đang xác nhận...' : 'Xác nhận & đặt lịch'}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {/* ĐÁNH GIÁ TỪ NGƯỜI DÙNG */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="rounded-[28px] border border-[#E8ECEE] bg-[#FCFDFC] p-8 shadow-[0_10px_35px_rgba(47, 169, 140,0.04)] space-y-5"
            >
              <h2 className="font-display text-xl font-extrabold text-[#172554] flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-amber-500 fill-amber-400" />
                Đánh giá thực tế từ bệnh nhân
              </h2>

              <ul className="space-y-4">
                {expert.reviews.map((review, idx) => (
                  <li
                    key={idx}
                    className="rounded-2xl bg-white border border-[#dbeafe] p-5 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-display text-sm font-black text-[#172554]">
                          {review.rating}/5
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#64748B]">
                        {review.user_display}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#172554] font-normal">
                      "{review.comment_vi}"
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpertDetailPage
