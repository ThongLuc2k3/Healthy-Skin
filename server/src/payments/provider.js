import config from '../config/env.js'
import { mockProvider } from './mockProvider.js'

// Interface tối giản mọi provider thanh toán phải có. Route/service nghiệp vụ (chatWalletService,
// venueService) chỉ gọi qua đây, không bao giờ import trực tiếp 1 provider cụ thể — nhờ vậy khi có
// tài khoản merchant thật, chỉ cần viết thêm 1 provider mới + đăng ký vào PROVIDERS bên dưới.
//
// createIntent({ userId, purpose, referenceId, amountVnd }) -> { intentId, status, providerRef }
//   status: 'succeeded' (mock, hoặc cổng thật xác nhận ngay) | 'pending' (chờ webhook/redirect)
//   providerRef: mã giao dịch để hiển thị/tra cứu, tương đương transaction id của cổng thật
// getStatus(intentId) -> { status }

const PROVIDERS = {
  mock: mockProvider,
  // vnpay: chưa đăng ký — xem server/src/payments/vnpayProvider.stub.js để biết cần làm gì khi có
  // tài khoản merchant thật (VNP_TMN_CODE/VNP_HASH_SECRET/VNP_URL), rồi thêm dòng `vnpay: vnpayProvider`
  // vào đây và đổi PAYMENT_PROVIDER=vnpay trong .env.
}

export function getProvider(name = config.paymentProvider) {
  const provider = PROVIDERS[name]
  if (!provider) {
    throw new Error(`Payment provider "${name}" chưa được cấu hình/đăng ký.`)
  }
  return provider
}
