import { useEffect } from 'react'

// Đặt tiêu đề tab trình duyệt riêng cho từng trang thay vì dùng chung 1 title tĩnh trong
// index.html. Trả lại "HEALTHY SKIN" khi unmount để không để lại title của trang trước đó
// trong lúc trang mới đang tải (ví dụ chuyển route nhanh).
export function useDocumentTitle(title) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} · HEALTHY SKIN` : 'HEALTHY SKIN'
    return () => {
      document.title = previousTitle
    }
  }, [title])
}
