import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import config from '../config/env.js'
import { getThreadForUser, getThreadForExpert } from '../services/consultationService.js'

// Nhắn tin tư vấn thời gian thực — thay cho polling 15s cũ ở BookingDetailPage/ExpertDashboardPage.
// Phòng chat được nhóm theo threadId (không phải bookingId) vì cả 2 phía user/expert đều quy về
// cùng 1 thread khi đã xác thực quyền sở hữu.
const rooms = new Map() // threadId -> Set<WebSocket>

function joinRoom(threadId, ws) {
  if (!rooms.has(threadId)) rooms.set(threadId, new Set())
  rooms.get(threadId).add(ws)
}

function leaveRoom(threadId, ws) {
  const set = rooms.get(threadId)
  if (!set) return
  set.delete(ws)
  if (set.size === 0) rooms.delete(threadId)
}

export function broadcastMessage(threadId, message) {
  const set = rooms.get(threadId)
  if (!set) return
  const payload = JSON.stringify({ type: 'message', message })
  for (const client of set) {
    if (client.readyState === client.OPEN) client.send(payload)
  }
}

// Browser WebSocket API không cho set header Authorization, nên token được truyền qua query
// string. Cùng JWT_SECRET với requireAuth/requireExpertAuth, chỉ đọc lại claim ở đây.
function verifyToken(token, expectedType) {
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (expectedType === 'expert') {
      return payload.type === 'expert' ? { expertId: payload.expertId } : null
    }
    return payload.type !== 'expert' ? { userId: payload.sub } : null
  } catch {
    return null
  }
}

export function attachConsultationHub(server) {
  const wss = new WebSocketServer({ server, path: '/ws/consultations' })

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, 'http://localhost')
    const token = url.searchParams.get('token') || ''
    const role = url.searchParams.get('role') === 'expert' ? 'expert' : 'user'
    const bookingId = Number(url.searchParams.get('bookingId'))

    const identity = verifyToken(token, role)
    if (!identity || !Number.isInteger(bookingId)) {
      ws.close(4001, 'Không xác thực được kết nối.')
      return
    }

    // Tái dùng đúng hàm kiểm tra quyền sở hữu đã có ở REST routes — không viết lại logic phân quyền.
    const result = role === 'expert'
      ? await getThreadForExpert(identity.expertId, bookingId)
      : await getThreadForUser(identity.userId, bookingId)

    if (!result) {
      ws.close(4004, 'Không tìm thấy cuộc trò chuyện tư vấn.')
      return
    }

    const threadId = result.thread.id
    joinRoom(threadId, ws)
    ws.isAlive = true
    ws.on('pong', () => { ws.isAlive = true })
    ws.on('close', () => leaveRoom(threadId, ws))
    ws.on('error', () => leaveRoom(threadId, ws))
  })

  // Dọn kết nối chết (mất mạng đột ngột không kịp gửi close frame) mỗi 30s.
  const heartbeat = setInterval(() => {
    for (const client of wss.clients) {
      if (client.isAlive === false) {
        client.terminate()
        continue
      }
      client.isAlive = false
      client.ping()
    }
  }, 30_000)

  wss.on('close', () => clearInterval(heartbeat))

  return wss
}
