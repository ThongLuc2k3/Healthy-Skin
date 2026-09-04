import { useState } from 'react'
import { formatVnd } from '../lib/format'
import { CheckCircleIcon, WalletIcon, CloseIcon } from './Icons'

const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Ví Healthy Skin' },
  { id: 'bank_card', label: 'Thẻ ngân hàng nội địa (ATM)' },
  { id: 'e_wallet', label: 'Ví điện tử' },
  { id: 'qr_transfer', label: 'Chuyển khoản QR' },
]

// Modal thanh toán dùng chung cho Gói Trợ Lý (nạp ví/mua gói) và đặt cọc dịch vụ, người dùng chọn
// phương thức rồi bấm xác nhận, xử lý giả lập ~3 giây trước khi gọi API thật (đã xác nhận tức thì
// phía backend) để trải nghiệm giống một cổng thanh toán thật đang xử lý, thay vì phản hồi tức thì
// trông giả tạo. onConfirm là hàm async thực hiện lời gọi API thật, ném lỗi nếu thất bại.
function PaymentMethodModal({ open, amountVnd, title, onConfirm, onClose }) {
  const [method, setMethod] = useState('wallet')
  const [stage, setStage] = useState('select')
  const [errorMsg, setErrorMsg] = useState('')

  if (!open) return null

  async function handleConfirm() {
    setStage('processing')
    setErrorMsg('')
    await new Promise((resolve) => setTimeout(resolve, 3000))
    try {
      await onConfirm(method)
      setStage('success')
      setTimeout(() => {
        setStage('select')
        onClose()
      }, 1400)
    } catch (err) {
      setErrorMsg(err.message)
      setStage('select')
    }
  }

  function handleBackdropClick() {
    if (stage === 'select') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {stage === 'success' ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="font-bold text-[#172554]">Thanh toán thành công!</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#172554]">{title}</h3>
                <p className="mt-1 text-2xl font-black text-[#2563eb]">{formatVnd(amountVnd)}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={stage === 'processing'}
                aria-label="Đóng"
                className="rounded-lg p-1 text-[#64748B] hover:bg-[#eff6ff] disabled:opacity-40"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium cursor-pointer transition ${
                    method === m.id ? 'border-[#2563eb] bg-[#2563eb]/5 text-[#172554]' : 'border-[#dbeafe] text-[#64748B]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    disabled={stage === 'processing'}
                    className="accent-[#2563eb]"
                  />
                  {m.id === 'wallet' && <WalletIcon className="h-4 w-4 text-[#2563eb]" />}
                  {m.label}
                </label>
              ))}
            </div>

            {errorMsg && (
              <p className="mt-3 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={stage === 'processing'}
              className="mt-5 w-full rounded-2xl bg-[#2563eb] px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-[#172554] disabled:opacity-60"
            >
              {stage === 'processing' ? 'Đang xử lý thanh toán...' : 'Xác nhận thanh toán'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentMethodModal
