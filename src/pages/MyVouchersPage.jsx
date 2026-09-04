import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { WalletIcon, CheckCircleIcon, GamepadIcon, SparklesIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const SOURCE_LABEL = {
  points_redeem: 'Đổi từ điểm tích luỹ',
  game_reward: 'Thưởng từ Skin Lab',
  package_bonus: 'Tặng kèm Gói Trợ Lý',
  welcome_gift: 'Quà chào mừng thành viên mới',
}

function formatDiscount(v) {
  return v.discountType === 'percent' ? `Giảm ${v.discountValue}%` : `Giảm ${v.discountValue.toLocaleString('vi-VN')}đ`
}

function MyVouchersPage() {
  useDocumentTitle('Kho Voucher')
  const { user } = useAuth()
  const [myVouchers, setMyVouchers] = useState([])
  const [catalog, setCatalog] = useState([])
  const [points, setPoints] = useState(0)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    const [mine, cat, wallet] = await Promise.all([
      apiClient.get('/vouchers/mine', { auth: true }),
      apiClient.get('/vouchers'),
      apiClient.get('/chat/wallet', { auth: true }),
    ])
    setMyVouchers(mine)
    setCatalog(cat.filter((v) => v.pointsCost > 0))
    setPoints(wallet.loyaltyPoints)
  }

  useEffect(() => {
    if (user) {
      loadAll().catch((err) => setError(err.message)).finally(() => setLoading(false))
    }
  }, [user])

  async function handleRedeem(voucherId) {
    setBusyId(voucherId)
    setError('')
    setMessage('')
    try {
      await apiClient.post('/vouchers/redeem', { voucherId }, { auth: true })
      setMessage('Đổi voucher thành công!')
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId('')
    }
  }

  if (!user) {
    return (
      <div className="mx-auto mt-24 max-w-md px-4 text-center">
        <p className="text-sm text-[#64748B]">
          Cần <Link to="/login" className="font-bold text-[#2563eb] hover:underline">đăng nhập</Link> để xem Kho Voucher.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#2563eb]">Đang tải Kho Voucher...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[900px]">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#60a5fa]/15 text-[#2563eb]">
            <WalletIcon className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-[#172554]">Kho Voucher</h1>
          <p className="mx-auto max-w-xl text-sm text-[#64748B]">
            Dùng voucher khi đặt dịch vụ ở{' '}
            <Link to="/dich-vu" className="font-semibold text-[#2563eb] underline">Dịch Vụ Quanh Bạn</Link>.
            Có 3 cách để có voucher: đổi điểm tích luỹ, chơi trắc nghiệm Skin Lab, hoặc mua Gói Trợ Lý.
          </p>
          <p className="inline-block rounded-full bg-[#2563eb]/10 px-4 py-1.5 text-xs font-bold text-[#2563eb]">
            Điểm tích luỹ hiện có: {points}
          </p>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700 text-center">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-6 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 text-center">
            {error}
          </p>
        )}

        <div className="mt-10 rounded-3xl border border-[#2563eb]/25 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-[#2563eb]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#2563eb]">Đổi điểm lấy voucher</h2>
          </div>
          {catalog.length === 0 ? (
            <p className="mt-3 text-sm text-[#64748B]">
              Hiện chưa có voucher nào mở đổi bằng điểm. Nạp ví ở trang{' '}
              <Link to="/pricing" className="font-semibold text-[#2563eb] underline">Gói Trợ Lý</Link> để tích điểm.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {catalog.map((v) => (
                <div key={v.id} className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-5">
                  <p className="font-bold text-[#172554]">{v.titleVi}</p>
                  <p className="mt-1 text-sm font-semibold text-[#2563eb]">{formatDiscount(v)}</p>
                  <p className="mt-2 text-xs text-[#64748B]">{v.pointsCost} điểm</p>
                  <button
                    type="button"
                    onClick={() => handleRedeem(v.id)}
                    disabled={busyId === v.id || points < v.pointsCost}
                    className="mt-3 w-full rounded-full bg-[#2563eb] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#172554] disabled:opacity-50"
                  >
                    {busyId === v.id ? 'Đang đổi...' : points < v.pointsCost ? 'Chưa đủ điểm' : 'Đổi voucher'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#2563eb]">Voucher đang có</h2>
          {myVouchers.length === 0 ? (
            <p className="mt-3 text-sm text-[#64748B]">Bạn chưa có voucher nào.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {myVouchers.map((v) => (
                <div
                  key={v.id}
                  className={`rounded-2xl border p-5 ${v.usedAt ? 'border-[#dbeafe] bg-[#eff6ff] opacity-60' : 'border-[#2563eb]/30 bg-white'}`}
                >
                  <p className="font-bold text-[#172554]">{v.titleVi}</p>
                  <p className="mt-1 text-sm font-semibold text-[#2563eb]">{formatDiscount(v)}</p>
                  <p className="mt-2 text-xs text-[#64748B]">{SOURCE_LABEL[v.obtainedVia] || v.obtainedVia}</p>
                  <p className="mt-1 text-xs font-bold text-[#64748B]">
                    {v.usedAt ? 'Đã sử dụng' : 'Chưa sử dụng'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            to="/skin-lab"
            className="flex items-center gap-3 rounded-2xl border border-[#dbeafe] bg-white p-5 transition hover:border-[#2563eb]"
          >
            <GamepadIcon className="h-6 w-6 text-[#2563eb]" />
            <div>
              <p className="text-sm font-bold text-[#172554]">Chơi Skin Lab để nhận voucher</p>
              <p className="text-xs text-[#64748B]">Hoàn thành trắc nghiệm để được thưởng.</p>
            </div>
          </Link>
          <Link
            to="/pricing"
            className="flex items-center gap-3 rounded-2xl border border-[#dbeafe] bg-white p-5 transition hover:border-[#2563eb]"
          >
            <SparklesIcon className="h-6 w-6 text-[#2563eb]" />
            <div>
              <p className="text-sm font-bold text-[#172554]">Mua Gói Trợ Lý</p>
              <p className="text-xs text-[#64748B]">Một số gói tặng kèm voucher ngay khi mua.</p>
            </div>
          </Link>
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <CheckCircleIcon className="h-4 w-4 text-[#2563eb]" />
          Voucher đổi được áp dụng trực tiếp khi đặt dịch vụ tại các trung tâm đối tác.
        </p>
      </div>
    </div>
  )
}

export default MyVouchersPage
