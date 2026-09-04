import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { apiClient, notifyChatWalletUpdated } from '../lib/apiClient'
import { formatVnd, formatDateTime } from '../lib/format'
import { WalletIcon, SparklesIcon, CheckCircleIcon, HistoryIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import PaymentMethodModal from '../components/PaymentMethodModal'

const PURPOSE_LABELS = {
  wallet_topup: 'Nạp ví',
  plan_purchase: 'Mua gói Trợ Lý',
  venue_deposit: 'Đặt cọc dịch vụ',
}

const TOPUP_PRESETS = [20000, 50000, 100000]

function PricingPage() {
  useDocumentTitle('Gói Trợ Lý')
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [plans, setPlans] = useState([])
  const [transactions, setTransactions] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [plansLoading, setPlansLoading] = useState(true)
  const [paymentRequest, setPaymentRequest] = useState(null)

  function loadTransactions() {
    apiClient.get('/chat/wallet/transactions', { auth: true }).then(setTransactions).catch(() => {})
  }

  useEffect(() => {
    apiClient.get('/chat/plans').then(setPlans).catch((err) => setError(err.message)).finally(() => setPlansLoading(false))
    if (user) {
      apiClient.get('/chat/wallet', { auth: true }).then(setWallet).catch((err) => setError(err.message))
      loadTransactions()
    }
  }, [user])

  async function confirmUpgrade(planId) {
    setError('')
    setMessage('')
    try {
      const status = await apiClient.post('/chat/upgrade', { planId }, { auth: true })
      setWallet(status)
      notifyChatWalletUpdated(status)
      const bonus = status.bonusVoucherTitle ? ` Tặng kèm voucher "${status.bonusVoucherTitle}" (xem ở Kho Voucher).` : ''
      setMessage(
        `Đã kích hoạt gói thành công, cộng thêm ${status.pointsEarned} điểm tích luỹ.${bonus} `
        + `Mã giao dịch: ${status.transactionRef} · ${formatDateTime(status.paidAt)}.`,
      )
      loadTransactions()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function confirmTopup(amount) {
    setError('')
    setMessage('')
    try {
      const status = await apiClient.post('/chat/topup', { amountVnd: amount }, { auth: true })
      setWallet(status)
      notifyChatWalletUpdated(status)
      setMessage(
        `Đã nạp ${formatVnd(amount)} vào ví thành công, cộng thêm ${status.pointsEarned} điểm tích luỹ. `
        + `Mã giao dịch: ${status.transactionRef} · ${formatDateTime(status.paidAt)}.`,
      )
      loadTransactions()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[1000px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#172554]">
            Gói Trợ Lý
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#64748B]">
            Miễn phí 100 câu hỏi mỗi ngày để hỏi Trợ Lý về cách dùng app hoặc thành phần cơ bản. Cần
            hỏi nhiều hơn thì mua thêm gói hoặc nạp ví bên dưới. Nếu bạn cần tư vấn sâu về tình trạng cụ thể, nên{' '}
            <Link to="/experts" className="font-semibold text-[#2563eb] underline">
              đặt lịch với chuyên gia thật
            </Link>{' '}
            thay vì hỏi thêm Trợ Lý.
          </p>
        </motion.div>

        {!user ? (
          <div className="mt-10 rounded-2xl border border-[#2563eb]/20 bg-white p-8 text-center shadow-xs">
            <p className="text-sm text-[#64748B]">
              Cần <Link to="/login" className="font-bold text-[#2563eb] hover:underline">đăng nhập</Link> để mua gói hoặc nạp ví.
            </p>
          </div>
        ) : (
          <>
            {wallet && (
              <div className="mt-10 rounded-2xl border border-[#dbeafe] bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#60a5fa]/15 text-[#2563eb]">
                    <WalletIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#172554]">Ví của bạn</p>
                    <p className="text-xs text-[#64748B]">
                      Còn {wallet.remainingFreeToday} câu miễn phí hôm nay · {wallet.purchasedQuestionsRemaining} câu đã mua · {wallet.loyaltyPoints} điểm tích luỹ
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#2563eb]/10 px-4 py-1.5 text-xs font-bold text-[#2563eb]">
                  Số dư: {formatVnd(wallet.balanceVnd)}
                </span>
              </div>
            )}

            {message && (
              <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700">
                {message}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}

            {plansLoading ? (
              <div className="mt-8 flex flex-col items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
                <p className="mt-3 text-sm font-bold text-[#2563eb]">Đang tải danh sách gói...</p>
              </div>
            ) : plans.length === 0 ? (
              <p className="mt-8 text-center text-sm text-[#64748B]">Hiện chưa có gói nào khả dụng, vui lòng quay lại sau.</p>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="rounded-[28px] border border-[#dbeafe] bg-white p-7 shadow-xs flex flex-col">
                    <SparklesIcon className="h-6 w-6 text-[#2563eb]" />
                    <h3 className="mt-4 text-lg font-bold text-[#172554]">{plan.name}</h3>
                    <p className="mt-1 text-2xl font-black text-[#2563eb]">{formatVnd(plan.priceVnd)}</p>
                    <p className="mt-1 text-sm text-[#64748B]">Cộng thêm {plan.questionQuota} câu hỏi</p>
                    <button
                      type="button"
                      onClick={() => setPaymentRequest({ type: 'upgrade', planId: plan.id, amountVnd: plan.priceVnd, title: `Mua ${plan.name}` })}
                      className="mt-6 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#172554]"
                    >
                      Mua gói
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-[28px] border border-[#dbeafe] bg-white p-7 shadow-xs">
              <h3 className="text-lg font-bold text-[#172554]">Nạp ví</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                Nạp ví được cộng thêm điểm tích luỹ (10.000đ = 1 điểm), dùng đổi voucher ở Kho Voucher.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {TOPUP_PRESETS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setPaymentRequest({ type: 'topup', amount, amountVnd: amount, title: 'Nạp ví' })}
                    className="flex items-center gap-2 rounded-full border border-[#2563eb]/30 bg-[#eff6ff] px-5 py-2.5 text-sm font-bold text-[#2563eb] transition hover:bg-[#60a5fa]/10"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Nạp {formatVnd(amount)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-[28px] border border-[#dbeafe] bg-white p-7 shadow-xs">
              <div className="flex items-center gap-2">
                <HistoryIcon className="h-5 w-5 text-[#2563eb]" />
                <h3 className="text-lg font-bold text-[#172554]">Lịch sử giao dịch</h3>
              </div>
              <div className="mt-4 space-y-2">
                {transactions.map((t) => (
                  <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#eff6ff] border border-[#dbeafe] px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-[#172554]">{PURPOSE_LABELS[t.purpose] || t.purpose}</p>
                      <p className="text-xs text-[#64748B]">
                        {formatDateTime(t.completedAt || t.createdAt)} · Mã: <span className="font-mono">{t.providerRef}</span>
                      </p>
                    </div>
                    <span className="font-bold text-[#2563eb]">{formatVnd(t.amountVnd)}</span>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-sm text-[#64748B]">Chưa có giao dịch nào.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <PaymentMethodModal
        open={Boolean(paymentRequest)}
        amountVnd={paymentRequest?.amountVnd ?? 0}
        title={paymentRequest?.title ?? ''}
        onClose={() => setPaymentRequest(null)}
        onConfirm={() => (paymentRequest.type === 'upgrade'
          ? confirmUpgrade(paymentRequest.planId)
          : confirmTopup(paymentRequest.amount))}
      />
    </div>
  )
}

export default PricingPage
