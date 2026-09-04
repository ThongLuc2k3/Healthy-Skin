// Tính giá cuối cùng sau khi áp voucher — tách riêng khỏi venueService để test được như hàm
// thuần, không phải khởi tạo kết nối PostgreSQL chỉ để kiểm tra logic tính giảm giá.
export function computeDiscountedPrice(priceVnd, voucher) {
  if (!voucher) return priceVnd
  return voucher.discount_type === 'percent'
    ? Math.round(priceVnd * (1 - voucher.discount_value / 100))
    : Math.max(priceVnd - voucher.discount_value, 0)
}
