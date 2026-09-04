// Tỉ lệ hoa hồng — GIÁ TRỊ DEMO minh hoạ, chưa chốt cùng mentor/đối tác thật (đúng kỷ luật không tự
// đặt số liệu thật của Healthy_Skin_Ke_Hoach_Phat_Trien_Chi_Tiet.pdf, mục 10.3 "Nguyên tắc doanh thu").
// Dùng hằng số ở đây thay vì rải số trực tiếp trong service, để khi có con số chính thức chỉ cần sửa
// đúng 1 chỗ.
export const EXPERT_COMMISSION_RATE = 0.15
export const VENUE_COMMISSION_RATE = 0.10

export function computeCommission(grossAmountVnd, rate) {
  return Math.round(grossAmountVnd * rate)
}
