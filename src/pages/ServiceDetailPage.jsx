import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { formatVnd, formatDate } from '../lib/format'
import { ArrowLeftIcon, CheckCircleIcon, StarIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import PaymentMethodModal from '../components/PaymentMethodModal'

function ServiceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [venue, setVenue] = useState(null)
  useDocumentTitle(venue?.name || 'Dịch vụ')
  const [reviews, setReviews] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedVoucherId, setSelectedVoucherId] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [coords, setCoords] = useState(null)
  const [fallbackAddress, setFallbackAddress] = useState('')
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        // Không có quyền vị trí, dùng địa chỉ tự khai trong hồ sơ làm phương án dự phòng
        // (mô phỏng theo quận/huyện, xem vnAreaCoords.js).
        if (user) {
          apiClient.get('/account', { auth: true })
            .then((account) => {
              if (account.addressVi) setFallbackAddress(account.addressVi)
            })
            .catch(() => {})
        }
      },
      { timeout: 8000 },
    )
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams()
    if (coords) {
      params.set('lat', coords.lat)
      params.set('lng', coords.lng)
    } else if (fallbackAddress) {
      params.set('address', fallbackAddress)
    }
    const query = params.toString()
    apiClient
      .get(`/venues/${id}${query ? `?${query}` : ''}`)
      .then((data) => {
        setVenue(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id, coords, fallbackAddress])

  useEffect(() => {
    apiClient.get(`/venues/${id}/reviews`).then(setReviews).catch(() => {})
  }, [id])

  useEffect(() => {
    if (!user) return
    apiClient.get('/vouchers/mine?onlyUnused=true', { auth: true }).then(setVouchers).catch(() => {})
  }, [user])

  async function handleBook() {
    setError('')
    try {
      const result = await apiClient.post(
        `/venues/services/${selectedServiceId}/book`,
        { userVoucherId: selectedVoucherId || null },
        { auth: true },
      )
      setConfirmedBooking(result)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  if (status === 'loading') {
    return <p className="mx-auto mt-24 text-center text-sm text-[#64748B]">Đang tải...</p>
  }
  if (status === 'error' || !venue) {
    return (
      <div className="mx-auto mt-24 max-w-lg px-4 text-center">
        <p className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700">
          Không tìm thấy trung tâm.
        </p>
        <Link to="/dich-vu" className="mt-4 inline-block text-sm font-bold text-[#2563eb] underline">
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  if (confirmedBooking) {
    return (
      <div className="mx-auto mt-16 max-w-lg px-4 py-12">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-600" />
          <h1 className="text-xl font-bold text-[#172554]">Đặt dịch vụ thành công</h1>
          <p className="text-sm text-[#172554]">
            Mã hoá đơn: <span className="font-mono font-bold">{confirmedBooking.invoiceCode}</span>
          </p>
          {confirmedBooking.paymentRef && (
            <p className="text-xs text-[#64748B]">
              Mã giao dịch đặt cọc: <span className="font-mono">{confirmedBooking.paymentRef}</span>
            </p>
          )}
          <p className="text-2xl font-black text-[#2563eb]">{formatVnd(confirmedBooking.finalPriceVnd)}</p>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Vui lòng đến trực tiếp {venue.name} và xuất trình mã hoá đơn này.
          </p>
          <Link
            to="/dich-vu"
            className="mt-4 inline-block rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#172554]"
          >
            Quay lại Dịch Vụ Quanh Bạn
          </Link>
        </div>
      </div>
    )
  }

  const selectedService = venue.services.find((s) => s.id === selectedServiceId)
  const selectedVoucher = vouchers.find((v) => v.id === Number(selectedVoucherId))
  const previewPrice = selectedService && selectedVoucher
    ? selectedVoucher.discountType === 'percent'
      ? Math.round(selectedService.priceVnd * (1 - selectedVoucher.discountValue / 100))
      : Math.max(selectedService.priceVnd - selectedVoucher.discountValue, 0)
    : selectedService?.priceVnd

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[800px]">
        <Link to="/dich-vu" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#2563eb]">
          <ArrowLeftIcon className="h-4 w-4" />
          Dịch Vụ Quanh Bạn
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 rounded-[28px] border border-[#dbeafe] bg-white p-8 shadow-xs"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2563eb]">
            {venue.category}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-[#172554]">{venue.name}</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {venue.addressVi}
            {venue.distanceKm != null && <span className="font-semibold text-[#A87A45]"> · cách bạn {venue.distanceKm}km</span>}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] border border-[#dbeafe] px-3 py-1">
            <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-[#172554]">{venue.ratingAvg.toFixed(1)}</span>
            <span className="text-xs text-[#64748B]">({venue.reviewCount} đánh giá)</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{venue.descriptionVi}</p>

          <div className="mt-6 border-t border-[#dbeafe] pt-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Chọn dịch vụ</p>
            {venue.services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedServiceId(s.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selectedServiceId === s.id
                    ? 'border-[#2563eb] bg-[#2563eb]/5'
                    : 'border-[#dbeafe] hover:border-[#2563eb]/40'
                }`}
              >
                <span>
                  <span className="font-bold text-[#172554]">{s.nameVi}</span>
                  {s.durationMinutes && <span className="ml-2 text-xs text-[#64748B]">{s.durationMinutes} phút</span>}
                </span>
                <span className="font-bold text-[#2563eb]">{formatVnd(s.priceVnd)}</span>
              </button>
            ))}
          </div>

          {user ? (
            <>
              {vouchers.length > 0 && (
                <div className="mt-6 border-t border-[#dbeafe] pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Áp voucher (không bắt buộc)</p>
                  <select
                    value={selectedVoucherId}
                    onChange={(e) => setSelectedVoucherId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3 py-2.5 text-sm text-[#172554]"
                  >
                    <option value="">Không dùng voucher</option>
                    {vouchers.map((v) => (
                      <option key={v.id} value={v.id}>{v.titleVi}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedService && (
                <div className="mt-6 flex items-center justify-between rounded-xl bg-[#eff6ff] border border-[#dbeafe] px-4 py-3">
                  <span className="text-sm font-semibold text-[#172554]">Tổng cộng</span>
                  <span className="text-lg font-black text-[#2563eb]">{formatVnd(previewPrice)}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowPayment(true)}
                disabled={!selectedServiceId}
                className="mt-6 w-full rounded-2xl bg-[#2563eb] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-[#172554] disabled:opacity-50"
              >
                Đặt cọc & xác nhận
              </button>
              {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-6 w-full rounded-2xl bg-[#2563eb] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white hover:bg-[#172554]"
            >
              Đăng nhập để đặt dịch vụ
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 rounded-[28px] border border-[#dbeafe] bg-white p-8 shadow-xs space-y-5"
        >
          <div className="flex items-center gap-2">
            <StarIcon className="h-5 w-5 fill-amber-400 text-amber-400" />
            <h2 className="text-lg font-bold text-[#172554]">
              Đánh giá từ khách hàng ({venue.reviewCount})
            </h2>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-[#64748B]">Chưa có đánh giá nào cho trung tâm này.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-[#172554]">{review.rating}/5</span>
                    </div>
                    <span className="text-xs text-[#64748B]">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#172554]">"{review.commentVi}"</p>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      <PaymentMethodModal
        open={showPayment}
        amountVnd={previewPrice ?? 0}
        title={`Đặt cọc tại ${venue.name}`}
        onClose={() => setShowPayment(false)}
        onConfirm={handleBook}
      />
    </div>
  )
}

export default ServiceDetailPage
