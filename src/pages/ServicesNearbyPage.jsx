import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiClient } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import { MapIcon, SearchIcon, StarIcon, WalletIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function VenueCard({ venue, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        to={`/dich-vu/${venue.id}`}
        className="block h-full rounded-[24px] border border-[#dbeafe] bg-white p-6 shadow-xs transition hover:border-[#2563eb] hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2563eb]">
            {venue.category}
          </span>
          {venue.distanceKm != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D8B27A]/15 border border-[#D8B27A]/30 px-2.5 py-1 text-[11px] font-bold text-[#A87A45] shrink-0">
              <MapIcon className="h-3 w-3" />
              cách bạn {venue.distanceKm}km
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-bold text-[#172554]">{venue.name}</h3>
        <p className="mt-1 text-xs text-[#64748B]">{venue.areaVi}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] border border-[#dbeafe] px-2.5 py-1">
          <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-[#172554]">{venue.ratingAvg.toFixed(1)}</span>
          <span className="text-[11px] text-[#64748B]">({venue.reviewCount} đánh giá)</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{venue.descriptionVi}</p>
      </Link>
    </motion.div>
  )
}

function ServicesNearbyPage() {
  useDocumentTitle('Dịch Vụ Quanh Bạn')
  const { user } = useAuth()
  const [venues, setVenues] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [status, setStatus] = useState('loading')
  const [searchTerm, setSearchTerm] = useState('')
  const [coords, setCoords] = useState(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [fallbackAddress, setFallbackAddress] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationDenied(true),
      { timeout: 8000 },
    )
  }, [])

  // Trình duyệt không cấp quyền vị trí, dùng địa chỉ tự khai trong "Tài khoản của tôi" làm phương
  // án dự phòng để vẫn ước tính được khoảng cách (mô phỏng theo quận/huyện, xem vnAreaCoords.js).
  useEffect(() => {
    if (!locationDenied || !user) return
    apiClient.get('/account', { auth: true })
      .then((account) => {
        if (account.addressVi) setFallbackAddress(account.addressVi)
      })
      .catch(() => {})
  }, [locationDenied, user])

  useEffect(() => {
    // Sắp theo bảng chữ cái để dải nút lọc luôn hiện cùng 1 thứ tự dự đoán được, thay vì phụ
    // thuộc thứ tự API /venues/categories trả về.
    apiClient
      .get('/venues/categories')
      .then((list) => setCategories([...list].sort((a, b) => a.localeCompare(b, 'vi'))))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setStatus('loading')
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (coords) {
      params.set('lat', coords.lat)
      params.set('lng', coords.lng)
    } else if (fallbackAddress) {
      params.set('address', fallbackAddress)
    }
    const query = params.toString()
    apiClient
      .get(query ? `/venues?${query}` : '/venues')
      .then((data) => {
        setVenues(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [activeCategory, coords, fallbackAddress])

  const grouped = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return venues
    return venues.filter((v) =>
      v.name.toLowerCase().includes(term)
      || v.areaVi.toLowerCase().includes(term)
      || v.descriptionVi.toLowerCase().includes(term))
  }, [venues, searchTerm])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[1100px]">
        <Link
          to="/dich-vu/voucher"
          aria-label="Kho Voucher của bạn"
          title="Kho Voucher của bạn"
          className="absolute right-4 top-0 flex items-center gap-1.5 rounded-2xl bg-white border border-[#dbeafe] px-3.5 py-2.5 text-sm font-bold text-[#2563eb] shadow-xs transition-colors hover:border-[#2563eb]"
        >
          <WalletIcon className="h-5 w-5" />
          Voucher
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#60a5fa]/15 text-[#2563eb]">
            <MapIcon className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#172554]">
            Dịch Vụ Quanh Bạn
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#64748B]">
            Đặt spa, phòng khám, gym, xông hơi... tại các trung tâm đối tác với giá cố định do chính
            trung tâm niêm yết. Là chủ spa/phòng khám/gym?{' '}
            <Link to="/dich-vu/dang-ky" className="font-semibold text-[#2563eb] underline">
              Đăng ký làm đối tác
            </Link>
.
          </p>
          {locationDenied && (
            <p className="text-xs text-[#64748B]">
              {fallbackAddress
                ? 'Không lấy được vị trí trình duyệt, đang ước tính khoảng cách theo địa chỉ trong hồ sơ của bạn.'
                : 'Không lấy được vị trí của bạn nên chưa hiển thị khoảng cách. Bật quyền vị trí trên trình duyệt, hoặc khai báo địa chỉ ở "Tài khoản của tôi" để ước tính khoảng cách.'}
            </p>
          )}
        </motion.div>

        <div className="mt-8 mx-auto max-w-md rounded-2xl bg-white p-3 border border-[#dbeafe] shadow-lg flex items-center gap-3">
          <SearchIcon className="ml-2 h-4 w-4 text-[#2563eb] shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên trung tâm, khu vực..."
            className="w-full bg-transparent text-sm font-medium text-[#172554] placeholder:text-[#64748B] focus:outline-none"
          />
        </div>

        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                !activeCategory ? 'bg-[#2563eb] text-white' : 'bg-white border border-[#dbeafe] text-[#64748B]'
              }`}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                  activeCategory === c ? 'bg-[#2563eb] text-white' : 'bg-white border border-[#dbeafe] text-[#64748B]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          {status === 'loading' && (
            <p className="text-center text-sm text-[#64748B]">Đang tải danh sách trung tâm...</p>
          )}
          {status === 'error' && (
            <p className="text-center text-sm text-rose-600">Không tải được danh sách trung tâm.</p>
          )}
          {status === 'ready' && grouped.length === 0 && (
            <div className="mx-auto max-w-md rounded-2xl border border-[#dbeafe] bg-white p-8 text-center">
              <SearchIcon className="mx-auto h-8 w-8 text-[#2563eb]" />
              <p className="mt-3 text-sm text-[#64748B]">Không tìm thấy trung tâm nào khớp với bộ lọc hiện tại.</p>
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServicesNearbyPage
