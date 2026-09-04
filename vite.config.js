import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
      },
      // Ảnh/video tự tải lên (review, motivation post...) được backend trả về dạng đường dẫn
      // tương đối "/uploads/..." — nếu thiếu proxy này, trình duyệt sẽ gọi nhầm sang chính cổng
      // 5173 (không phục vụ /uploads) mỗi khi VITE_API_BASE_URL chưa được set (ví dụ chạy `vite`
      // riêng lẻ thay vì qua script dev:all), khiến ảnh vỡ/hiện đen.
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
