import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { StarIcon, WarningIcon, StethoscopeIcon, CheckCircleIcon, SearchIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const SORT_OPTIONS = [
  { value: '', label: 'Mặc định' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'rating_desc', label: 'Đánh giá cao nhất' },
]

function MapPinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 21s-7-5.33-7-11.5a7 7 0 0114 0C19 15.67 12 21 12 21z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function formatFee(feeVnd) {
  if (!feeVnd) return 'Liên hệ để biết giá'
  return `${feeVnd.toLocaleString('vi-VN')}đ / buổi`
}

function ExpertCard({ expert, index }) {
  const hasUnverified = expert.certifications?.some((c) => !c.verified) ?? false

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/experts/${expert.id}`}
        className="group relative flex flex-col justify-between h-full rounded-[28px] border border-[#dbeafe] bg-[#f8fbff] p-7 shadow-[0_12px_40px_rgba(47, 169, 140,0.06)] transition-all duration-300 hover:border-[#2563eb] hover:shadow-[0_20px_50px_rgba(47, 169, 140,0.12)] overflow-hidden"
      >
        {/* Subtle Ambient Radial Lighting overlay */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#60a5fa]/20 via-[#BFD8CF]/20 to-transparent blur-2xl group-hover:scale-150 transition-transform duration-500" />

        <div className="relative z-10 space-y-5">
          {/* HEADER AVATAR & AI BADGE */}
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#60a5fa] to-[#1d4ed8] text-white shadow-[0_6px_20px_rgba(47, 169, 140,0.3)] group-hover:scale-105 transition-transform duration-300">
                <StethoscopeIcon className="h-8 w-8" />
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1 text-[11px] font-bold text-[#64748B]">
              <MapPinIcon className="h-3 w-3 text-[#2563eb]" />
              {expert.area_vi}
            </span>
          </div>

          {/* DOCTOR NAME & CLINIC */}
          <div>
            <h3 className="font-display text-xl font-black text-[#172554] group-hover:text-[#2563eb] transition-colors leading-snug">
              {expert.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-[#64748B]">
              {expert.specialty}
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]/80 font-normal">
              {expert.clinic_name}
            </p>
          </div>

          {/* RATING & REVIEWS */}
          <div className="flex items-center gap-2 rounded-xl bg-[#eff6ff] p-3 border border-[#dbeafe]">
            <div className="flex items-center gap-1 text-amber-500">
              <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-display text-base font-black text-[#172554]">
                {expert.rating_avg.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-[#64748B] font-normal">
              ({expert.reviews.length} đánh giá thực tế)
            </span>
          </div>

          {/* GIÁ TƯ VẤN */}
          <p className="text-sm font-bold text-[#2563eb]">{formatFee(expert.consultation_fee_vnd)}</p>

          {/* CERTIFICATION STATUS BADGE */}
          <div>
            {hasUnverified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D8B27A]/15 border border-[#D8B27A]/30 px-3 py-1 text-[11px] font-bold text-[#A87A45]">
                <WarningIcon className="h-3.5 w-3.5 text-[#A87A45]" />
                Chờ xác thực chứng chỉ
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1d4ed8]/15 border border-[#1d4ed8]/30 px-3 py-1 text-[11px] font-bold text-[#2563eb]">
                <CheckCircleIcon className="h-3.5 w-3.5 text-[#1d4ed8]" />
                Đã xác thực y khoa
              </span>
            )}
          </div>
        </div>

        {/* PRIMARY CTA GLASS BUTTON */}
        <div className="relative z-10 pt-6 mt-4 border-t border-[#dbeafe]">
          <motion.div
            whileHover={{ backgroundPosition: 'right center' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(47, 169, 140,0.25)] transition-colors cursor-pointer overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(to right, #2563eb 0%, #60a5fa 51%, #2563eb 100%)',
              backgroundSize: '200% auto',
              transition: '0.5s',
            }}
          >
            <span>Đặt lịch tư vấn 1-1</span>
            <span>→</span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

function ExpertListPage() {
  useDocumentTitle('Chuyên gia tư vấn')
  const { user } = useAuth()
  const [experts, setExperts] = useState([])
  const [areas, setAreas] = useState([])
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [dayFilter, setDayFilter] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([apiClient.get('/experts'), apiClient.get('/experts/areas')])
      .then(([expertsList, areasList]) => {
        setExperts(expertsList)
        // Sắp theo bảng chữ cái tiếng Việt thay vì để nguyên thứ tự API trả về (không cố định),         // để mỗi lần tải trang, danh sách khu vực trong bộ lọc luôn hiện đúng 1 thứ tự dự đoán được.
        setAreas([...areasList].sort((a, b) => a.localeCompare(b, 'vi')))
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [user])

  useEffect(() => {
    if (!user || status !== 'ready') return
    const path = area ? `/experts?area=${encodeURIComponent(area)}` : '/experts'
    apiClient.get(path).then(setExperts).catch(() => {})
  }, [area, user, status])

  // Tìm kiếm/lọc/sắp xếp làm ở client vì danh sách chuyên gia nhỏ (vài chục), không đáng thêm
  // query param mới cho backend, chỉ bộ lọc khu vực mới gọi lại API vì nó đổi luôn cả danh sách nền.
  const displayedExperts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    let list = experts.filter((e) => {
      const matchesTerm = !term
        || e.name.toLowerCase().includes(term)
        || e.specialty.toLowerCase().includes(term)
        || e.clinic_name.toLowerCase().includes(term)
      const matchesDay = !dayFilter || e.available_slots.some((slot) => slot.startsWith(dayFilter))
      return matchesTerm && matchesDay
    })

    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => (a.consultation_fee_vnd || Infinity) - (b.consultation_fee_vnd || Infinity))
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => (b.consultation_fee_vnd || 0) - (a.consultation_fee_vnd || 0))
    } else if (sortBy === 'rating_desc') {
      list = [...list].sort((a, b) => b.rating_avg - a.rating_avg)
    }

    return list
  }, [experts, searchTerm, sortBy, dayFilter])

  if (!user) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#eff6ff] via-[#f8fbff] to-[#eff6ff] mt-12">
        {/* Soft Ambient Radial Lighting Circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#60a5fa]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
          <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-xl rounded-[32px] border border-[#dbeafe] bg-[#f8fbff]/90 p-8 sm:p-12 text-center backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)] space-y-5"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#60a5fa] to-[#1d4ed8] text-white shadow-[0_6px_20px_rgba(47, 169, 140,0.3)]">
            <StethoscopeIcon className="h-8 w-8" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#172554]">
            Yêu cầu đăng nhập
          </h1>

          <p className="text-sm leading-relaxed text-[#64748B] max-w-md mx-auto font-normal">
            Vui lòng đăng nhập để truy cập mạng lưới tư vấn 1-1 với bác sĩ da liễu, đối chiếu hồ sơ cá nhân và đặt lịch hẹn.
          </p>

          <div className="pt-2">
            <motion.div
              whileHover={{ backgroundPosition: 'right center' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center justify-center rounded-full shadow-[0_8px_25px_rgba(112, 196, 175,0.35)] cursor-pointer overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #2563eb 0%, #60a5fa 51%, #2563eb 100%)',
                backgroundSize: '200% auto',
                transition: '0.5s',
              }}
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-9 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white cursor-pointer"
              >
                Đăng nhập ngay
                <span>→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#f8fbff] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Lighting Circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#60a5fa]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -left-20 h-[400px] w-[400px] rounded-full bg-[#60a5fa]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-12">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#dbeafe] bg-[#f8fbff]/90 p-8 sm:p-14 backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)] text-center space-y-4"
        >

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#172554]">
            Kết Nối Chuyên Gia
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Đặt lịch tư vấn 1-1 trực tiếp với các chuyên gia hàng đầu về da liễu và dinh dưỡng được đối chiếu phù hợp nhất với hồ sơ cá nhân của bạn.
          </p>

          <div className="mx-auto max-w-xl rounded-2xl bg-[#D8B27A]/10 border border-[#D8B27A]/30 p-4 text-center text-xs text-[#A87A45] leading-relaxed backdrop-blur-xs font-medium">
            Vui lòng gọi trước cho phòng khám để xác nhận khung giờ trống trước khi đến trực tiếp.
          </div>

          <p className="text-xs text-[#64748B]">
            Bạn là bác sĩ hoặc chuyên gia dinh dưỡng?{' '}
            <Link to="/experts/dang-ky" className="font-semibold text-[#2563eb] underline">
              Đăng ký tham gia tư vấn
            </Link>
          </p>
        </motion.div>

        {/* SEARCH & GLASS FILTER BAR */}
        {status === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto max-w-3xl space-y-3"
          >
            <div className="rounded-2xl bg-[#f8fbff] p-3 border border-[#dbeafe] shadow-lg backdrop-blur-xl flex items-center gap-3">
              <SearchIcon className="ml-2 h-4 w-4 text-[#2563eb] shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, chuyên khoa, phòng khám..."
                className="w-full bg-transparent text-sm font-medium text-[#172554] placeholder:text-[#64748B] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {areas.length > 0 && (
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="rounded-xl bg-[#eff6ff] border border-[#dbeafe] px-4 py-2.5 text-xs font-bold text-[#172554] focus:border-[#2563eb] focus:outline-none cursor-pointer"
                >
                  <option value="">Tất cả khu vực</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl bg-[#eff6ff] border border-[#dbeafe] px-4 py-2.5 text-xs font-bold text-[#172554] focus:border-[#2563eb] focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDayFilter('')}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    !dayFilter ? 'bg-[#2563eb] text-white' : 'bg-white border border-[#dbeafe] text-[#64748B]'
                  }`}
                >
                  Mọi ngày
                </button>
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDayFilter(dayFilter === d ? '' : d)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                      dayFilter === d ? 'bg-[#2563eb] text-white' : 'bg-white border border-[#dbeafe] text-[#64748B]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* EXPERTS LIST GRID */}
        <div className="space-y-6">
          {status === 'loading' && (
            <div className="py-20 text-center space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
              <p className="text-sm font-bold text-[#2563eb]">Đang đối chiếu dữ liệu chuyên gia từ AI...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mx-auto max-w-md rounded-2xl bg-rose-50 border border-rose-200 p-5 text-center text-sm font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          {status === 'ready' && displayedExperts.length === 0 && (
            <div className="py-16 text-center text-sm font-medium text-[#64748B] rounded-3xl border border-dashed border-[#BFD8CF] bg-[#f8fbff]">
              Không tìm thấy chuyên gia nào khớp với bộ lọc hiện tại.
            </div>
          )}

          {status === 'ready' && displayedExperts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedExperts.map((expert, index) => (
                <ExpertCard key={expert.id} expert={expert} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpertListPage
