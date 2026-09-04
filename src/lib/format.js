export function formatVnd(amount) {
  return (amount || 0).toLocaleString('vi-VN') + 'đ'
}

export function formatDate(iso) {
  if (!iso) return 'Chưa có'
  return new Date(iso).toLocaleDateString('vi-VN')
}

export function formatDateTime(iso) {
  if (!iso) return 'Chưa có'
  return new Date(iso).toLocaleString('vi-VN')
}

// Rút gọn số lớn kiểu 1000 -> 1K, 1000000 -> 1M, 1000000000 -> 1T (T = tỷ, không phải trillion), // dùng cho số người theo dõi/lượt xem, tránh in ra chuỗi số dài như "10000000".
export function formatCompactNumber(value) {
  const n = Number(value) || 0
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  if (abs >= 1_000_000_000) return `${sign}${trimZero(abs / 1_000_000_000)}T`
  if (abs >= 1_000_000) return `${sign}${trimZero(abs / 1_000_000)}M`
  if (abs >= 1_000) return `${sign}${trimZero(abs / 1_000)}K`
  return String(n)
}

function trimZero(value) {
  return Number(value.toFixed(1)).toString()
}
