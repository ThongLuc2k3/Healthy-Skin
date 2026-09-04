import { getToken, getExpertToken } from './apiClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const POLL_FALLBACK_MS = 30000
const MAX_RECONNECT_DELAY_MS = 10000

// Suy ra gốc WebSocket từ đúng biến VITE_API_BASE_URL mà apiClient.js đang dùng, khi
// scripts/dev-all.mjs tự đổi cổng, biến này là URL tuyệt đối (http://localhost:<port>/api) nên
// không đi qua proxy Vite; khi để mặc định ('/api') thì dùng luôn origin hiện tại (proxy /ws dev,
// hoặc cùng origin lúc production vì backend phục vụ chung 1 service).
function resolveWsBaseUrl() {
  if (/^https?:\/\//.test(API_BASE_URL)) {
    return API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/?$/, '')
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}`
}

// Mở kết nối realtime cho 1 thread tư vấn. role='user' dùng token người dùng thường, role='expert'
// dùng token Expert Dashboard. Tự reconnect có backoff; nếu WS không dùng được (môi trường host nào
// đó chặn upgrade), rơi về gọi onFallbackPoll() mỗi 30s làm lưới an toàn thay vì mất tính năng.
export function openConsultationSocket({ bookingId, role = 'user', onMessage, onFallbackPoll }) {
  let ws = null
  let closedByCaller = false
  let reconnectDelay = 1000
  let reconnectTimer = null
  let pollTimer = null
  let everConnected = false

  function stopFallbackPoll() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startFallbackPoll() {
    if (pollTimer || !onFallbackPoll) return
    pollTimer = setInterval(onFallbackPoll, POLL_FALLBACK_MS)
  }

  function connect() {
    if (closedByCaller) return
    const token = role === 'expert' ? getExpertToken() : getToken()
    if (!token) return

    const base = resolveWsBaseUrl()
    const url = `${base}/ws/consultations?token=${encodeURIComponent(token)}&role=${role}&bookingId=${bookingId}`
    ws = new WebSocket(url)

    ws.onopen = () => {
      everConnected = true
      reconnectDelay = 1000
      stopFallbackPoll()
    }

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'message') onMessage?.(payload.message)
      } catch {
        // bỏ qua frame không đúng định dạng
      }
    }

    ws.onclose = () => {
      if (closedByCaller) return
      // Chưa từng kết nối được lần nào (ví dụ môi trường chặn WS), dùng polling ngay,
      // không cố reconnect vô hạn gây tốn tài nguyên.
      if (!everConnected) {
        startFallbackPoll()
        return
      }
      reconnectTimer = setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS)
      startFallbackPoll()
    }

    ws.onerror = () => {
      ws?.close()
    }
  }

  connect()

  return {
    close() {
      closedByCaller = true
      stopFallbackPoll()
      if (reconnectTimer) clearTimeout(reconnectTimer)
      ws?.close()
    },
  }
}
