// Bộ khung cho cổng VNPay thật — CHƯA đăng ký vào provider.js, CHƯA hoạt động. Nhóm chưa có tài
// khoản merchant/API key tại thời điểm viết file này (2026-08-19).
//
// Khi có tài khoản merchant thật, cần làm đúng 3 việc, không đụng gì khác trong repo:
//   1. Điền các biến môi trường vào server/.env:
//      - VNP_TMN_CODE       (mã website do VNPay cấp)
//      - VNP_HASH_SECRET    (khoá bí mật ký/verify checksum, KHÔNG commit vào repo)
//      - VNP_URL            (endpoint sandbox hoặc production của VNPay)
//      - VNP_RETURN_URL     (URL VNPay redirect người dùng về sau khi thanh toán)
//   2. Implement 2 hàm bên dưới: createIntent() dựng URL thanh toán VNPay (ký HMAC-SHA512 theo tài
//      liệu VNPay), trả status='pending' kèm redirectUrl; verifyReturnOrWebhook() xác minh checksum
//      từ VNPay trả về rồi cập nhật payment_intents.status tương ứng.
//   3. Thêm `vnpay: vnpayProvider` vào PROVIDERS trong server/src/payments/provider.js, và đặt
//      PAYMENT_PROVIDER=vnpay trong .env.
//
// Không cần sửa chatWalletService.js/venueService.js/route nào khác — toàn bộ nghiệp vụ chỉ gọi
// qua interface ở provider.js.

export const vnpayProvider = {
  async createIntent() {
    throw new Error(
      'VNPay chưa được cấu hình — cần VNP_TMN_CODE/VNP_HASH_SECRET/VNP_URL/VNP_RETURN_URL thật trong .env.',
    )
  },

  async getStatus() {
    throw new Error('VNPay chưa được cấu hình.')
  },
}
