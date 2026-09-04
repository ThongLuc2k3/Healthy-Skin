import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { CheckCircleIcon, WarningIcon, SparklesIcon, SearchIcon, HistoryIcon, StethoscopeIcon, MapIcon, WalletIcon } from '../components/Icons'
import { RESULT } from '../logic/matchEngine'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatVnd, formatDateTime } from '../lib/format'

// Tất cả loại hoạt động gộp chung 1 dòng thời gian, sắp mới nhất trước, bấm nút lọc bên dưới để
// thu hẹp về đúng 1 loại, mặc định ('all') hiện hết. Trước đây mỗi loại là 1 tab tách biệt, vào
// trang chỉ thấy đúng tab "Quét sản phẩm", các hoạt động khác (giao dịch, lịch hẹn...) bị ẩn hoàn
// toàn cho tới khi tự bấm qua tab khác.
const FILTERS = [
  { key: 'all', label: 'Tất cả', icon: HistoryIcon },
  { key: 'scan', label: 'Quét sản phẩm', icon: SparklesIcon },
  { key: 'transactions', label: 'Giao dịch', icon: WalletIcon },
  { key: 'vouchers', label: 'Voucher', icon: HistoryIcon },
  { key: 'expert-bookings', label: 'Lịch hẹn chuyên gia', icon: StethoscopeIcon },
  { key: 'venue-bookings', label: 'Đặt dịch vụ', icon: MapIcon },
]

const TRANSACTION_PURPOSE_LABELS = {
  wallet_topup: 'Nạp ví',
  plan_purchase: 'Mua gói Trợ Lý',
  venue_deposit: 'Đặt cọc dịch vụ',
}

const VOUCHER_SOURCE_LABELS = {
  points_redeem: 'Đổi điểm tích luỹ',
  game_reward: 'Thưởng minigame Skin Lab',
  package_bonus: 'Tặng kèm mua Gói Trợ Lý',
  welcome_gift: 'Quà chào mừng',
}

const SCAN_THEME = {
  [RESULT.SUITABLE]: {
    badge: 'bg-[#6F9D8D]/15 text-[#2563eb] border border-[#6F9D8D]/30',
    label: 'Phù hợp hoàn toàn',
    icon: CheckCircleIcon,
  },
  [RESULT.CAUTION]: {
    badge: 'bg-[#D8B27A]/15 text-[#A87A45] border border-[#D8B27A]/30',
    label: 'Cần cân nhắc',
    icon: WarningIcon,
  },
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  // PostgreSQL trả ISO 8601 có timezone; vẫn chấp nhận định dạng SQLite cũ
  // để dữ liệu/API cache cũ không làm trang lịch sử bị "Invalid Date".
  const normalized = timestamp.includes('T') ? timestamp : `${timestamp.replace(' ', 'T')}Z`
  const date = new Date(normalized)
  return date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
}

// Khung thẻ dùng chung cho mọi loại hoạt động, badge loại + thời gian ở trên, tiêu đề + nội dung
// riêng của từng loại ở dưới (children).
function ActivityCard({ icon: Icon, typeLabel, createdAt, children }) {
  return (
    <div className="rounded-[24px] border border-[#E8ECEE] bg-[#FCFDFC] p-6 shadow-xs hover:border-[#2563eb] transition-all space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb]/10 px-3 py-1 text-[11px] font-bold text-[#2563eb]">
          <Icon className="h-3.5 w-3.5" />
          {typeLabel}
        </span>
        <span className="font-mono text-xs text-[#64748B]">{formatDate(createdAt)}</span>
      </div>
      {children}
    </div>
  )
}

function ScanCard({ entry }) {
  const theme = entry.result ? SCAN_THEME[entry.result] : null
  return (
    <ActivityCard icon={SparklesIcon} typeLabel="Quét sản phẩm" createdAt={entry.createdAt}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg font-black text-[#172554] leading-snug">
          {entry.matchedItemName || entry.productName || 'Không nhận diện được sản phẩm'}
        </h3>
        {theme && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold shrink-0 ${theme.badge}`}>
            <theme.icon className="h-3.5 w-3.5" />
            {theme.label}
          </span>
        )}
      </div>
      {entry.reason && (
        <div className="rounded-2xl bg-white border border-[#dbeafe] p-4 space-y-1">
          <p className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">Phân tích từ AI Assistant</p>
          <p className="text-sm leading-relaxed text-[#172554] font-normal">{entry.reason}</p>
        </div>
      )}
    </ActivityCard>
  )
}

function TransactionCard({ t }) {
  return (
    <ActivityCard icon={WalletIcon} typeLabel="Giao dịch" createdAt={t.completedAt || t.createdAt}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-[#172554]">{TRANSACTION_PURPOSE_LABELS[t.purpose] || t.purpose}</p>
        <span className="font-bold text-[#2563eb]">{formatVnd(t.amountVnd)}</span>
      </div>
      <p className="text-xs text-[#64748B]">Mã: <span className="font-mono">{t.providerRef}</span></p>
    </ActivityCard>
  )
}

function VoucherCard({ v }) {
  return (
    <ActivityCard icon={HistoryIcon} typeLabel="Voucher" createdAt={v.obtainedAt}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-[#172554]">{v.titleVi}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
          v.usedAt ? 'bg-[#eff6ff] text-[#64748B]' : 'bg-[#2563eb]/10 text-[#2563eb]'
        }`}>
          {v.usedAt ? 'Đã dùng' : 'Chưa dùng'}
        </span>
      </div>
      <p className="text-xs text-[#64748B]">{VOUCHER_SOURCE_LABELS[v.obtainedVia] || v.obtainedVia}</p>
      {v.obtainedVia === 'points_redeem' && v.pointsSpent != null && (
        <p className="text-xs text-[#64748B]">
          Đã đổi <span className="font-bold text-[#A87A45]">-{v.pointsSpent} điểm</span>
          {v.pointsBalanceAfter != null && <> · còn lại <span className="font-bold text-[#172554]">{v.pointsBalanceAfter} điểm</span></>}
        </p>
      )}
    </ActivityCard>
  )
}

function ExpertBookingCard({ b }) {
  return (
    <ActivityCard icon={StethoscopeIcon} typeLabel="Lịch hẹn chuyên gia" createdAt={b.createdAt}>
      <Link to={`/my-bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-2 hover:text-[#2563eb]">
        <div>
          <p className="font-bold text-[#172554]">{b.expert?.name} <span className="font-normal text-[#64748B]">· {b.expert?.specialty}</span></p>
          <p className="text-xs text-[#64748B]">Khung giờ: {b.slot}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold shrink-0 ${
          b.status === 'completed' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-[#2563eb]/10 text-[#2563eb]'
        }`}>
          {b.status === 'completed' ? 'Đã hoàn tất' : 'Đã đặt lịch'}
        </span>
      </Link>
    </ActivityCard>
  )
}

function VenueBookingCard({ b }) {
  return (
    <ActivityCard icon={MapIcon} typeLabel="Đặt dịch vụ" createdAt={b.createdAt}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-[#172554]">Mã hoá đơn: <span className="font-mono">{b.invoiceCode}</span></p>
        <div className="text-right">
          <span className="font-bold text-[#2563eb]">{formatVnd(b.finalPriceVnd)}</span>
          <p className="text-[11px] text-[#64748B] capitalize">{b.status.replace('_', ' ')}</p>
        </div>
      </div>
    </ActivityCard>
  )
}

function ScanHistoryPage() {
  useDocumentTitle('Lịch sử')
  const { user, ready } = useAuth()
  const [scanHistory, setScanHistory] = useState(null)
  const [transactions, setTransactions] = useState(null)
  const [vouchers, setVouchers] = useState(null)
  const [expertBookings, setExpertBookings] = useState(null)
  const [venueBookings, setVenueBookings] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    apiClient.get('/scan/history', { auth: true }).then(setScanHistory).catch((err) => setError(err.message))
    apiClient.get('/chat/wallet/transactions', { auth: true }).then(setTransactions).catch(() => setTransactions([]))
    apiClient.get('/vouchers/mine', { auth: true }).then(setVouchers).catch(() => setVouchers([]))
    apiClient.get('/experts/bookings/mine', { auth: true }).then(setExpertBookings).catch(() => setExpertBookings([]))
    apiClient.get('/venues/bookings/mine', { auth: true }).then(setVenueBookings).catch(() => setVenueBookings([]))
  }, [user])

  const loading = scanHistory === null || transactions === null || vouchers === null
    || expertBookings === null || venueBookings === null

  // Gộp 5 nguồn thành 1 danh sách chung, mỗi phần tử gắn `type` để lọc và `createdAt` để sắp xếp,
  // sắp mới nhất trước. Chỉ tính khi đủ dữ liệu (tránh gộp lại mỗi lần 1 nguồn riêng lẻ trả về).
  const items = useMemo(() => {
    if (loading) return []
    const all = [
      ...(scanHistory || []).map((e) => ({ type: 'scan', createdAt: e.createdAt, key: `scan-${e.id}`, data: e })),
      ...(transactions || []).map((t) => ({ type: 'transactions', createdAt: t.completedAt || t.createdAt, key: `tx-${t.id}`, data: t })),
      ...(vouchers || []).map((v) => ({ type: 'vouchers', createdAt: v.obtainedAt, key: `voucher-${v.id}`, data: v })),
      ...(expertBookings || []).map((b) => ({ type: 'expert-bookings', createdAt: b.createdAt, key: `expert-${b.id}`, data: b })),
      ...(venueBookings || []).map((b) => ({ type: 'venue-bookings', createdAt: b.createdAt, key: `venue-${b.id}`, data: b })),
    ]
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [loading, scanHistory, transactions, vouchers, expertBookings, venueBookings])

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.type === filter)

  const countsByType = useMemo(() => {
    const counts = { all: items.length }
    for (const f of FILTERS) {
      if (f.key === 'all') continue
      counts[f.key] = items.filter((i) => i.type === f.key).length
    }
    return counts
  }, [items])

  // UNAUTHENTICATED STATE
  if (ready && !user) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] mt-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#60a5fa]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
          <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-xl rounded-[32px] border border-[#E7ECEE] bg-[#FCFDFC]/90 p-8 sm:p-12 text-center backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)] space-y-5"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#60a5fa] to-[#6F9D8D] text-white shadow-[0_6px_20px_rgba(47, 169, 140,0.3)]">
            <SearchIcon className="h-8 w-8" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#172554]">
            Cần đăng nhập
          </h1>

          <p className="text-sm leading-relaxed text-[#64748B] max-w-md mx-auto font-normal">
            Đăng nhập để xem lịch sử tất cả những lần AI phân tích sản phẩm, theo dõi gợi ý và quản lý nhật ký chăm sóc da của bạn.
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
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden">
      {/* Soft Ambient Radial Lighting Circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#60a5fa]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-10 -left-20 h-[400px] w-[400px] rounded-full bg-[#60a5fa]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-12">
        {/* PAGE HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC]/90 p-8 sm:p-14 backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)] text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2563eb]/20 bg-[#2563eb]/8 px-4 py-1.5 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-[#2563eb]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">
              NHẬT KÝ HOẠT ĐỘNG CÁ NHÂN
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#172554]">
            Lịch Sử Hoạt Động
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B] font-normal">
            Toàn bộ lịch sử quét sản phẩm, giao dịch ví, voucher, lịch hẹn chuyên gia và đặt dịch vụ của bạn, gộp chung 1 dòng thời gian.
          </p>
        </motion.div>

        {/* FILTER SWITCHER */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                filter === f.key ? 'bg-[#2563eb] text-white' : 'bg-white border border-[#dbeafe] text-[#64748B]'
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
              {!loading && countsByType[f.key] > 0 && (
                <span className={`ml-0.5 rounded-full px-1.5 text-[10px] ${
                  filter === f.key ? 'bg-white/20' : 'bg-[#eff6ff]'
                }`}>
                  {countsByType[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="space-y-6">
          {error && (
            <div className="mx-auto max-w-xl rounded-2xl bg-rose-50 border border-rose-200 p-5 text-center text-sm font-bold text-rose-700">
              {error}
            </div>
          )}

          {!error && loading && (
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-[24px] border border-[#E8ECEE] bg-[#FCFDFC] p-6 shadow-xs animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-[#E8ECEE] rounded-full" />
                    <div className="h-4 w-24 bg-[#E8ECEE] rounded-full" />
                  </div>
                  <div className="h-6 w-2/3 bg-[#E8ECEE] rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border border-[#E8ECEE] bg-[#FCFDFC] p-12 text-center shadow-[0_12px_40px_rgba(47, 169, 140,0.06)] space-y-5 max-w-2xl mx-auto"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#60a5fa]/15 text-[#2563eb] border border-[#2563eb]/20">
                <SparklesIcon className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#172554]">
                {filter === 'all' ? 'Chưa có hoạt động nào' : 'Chưa có mục nào ở đây'}
              </h2>
              <p className="text-sm leading-relaxed text-[#64748B] max-w-md mx-auto font-normal">
                Hãy quét nhãn mỹ phẩm hoặc thực phẩm đầu tiên để AI phân tích đối chiếu, hoặc khám phá các tính năng khác của HEALTHY SKIN.
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
                    to="/scan"
                    className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    Quét sản phẩm ngay
                    <span>→</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {!loading && filteredItems.length > 0 && (
            <div className="space-y-5">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
                >
                  {item.type === 'scan' && <ScanCard entry={item.data} />}
                  {item.type === 'transactions' && <TransactionCard t={item.data} />}
                  {item.type === 'vouchers' && <VoucherCard v={item.data} />}
                  {item.type === 'expert-bookings' && <ExpertBookingCard b={item.data} />}
                  {item.type === 'venue-bookings' && <VenueBookingCard b={item.data} />}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScanHistoryPage
