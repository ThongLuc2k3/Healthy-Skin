import net from 'node:net'
import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'

const FRONTEND_PORT = 5173
const BACKEND_PORT = 4000

// Trước đây script này tự tìm cổng trống kế tiếp nếu 5173/4000 đang bận, rồi in ra cổng đã chọn —
// nhưng nếu cổng bận là do MỘT TIẾN TRÌNH CŨ (chưa tắt hẳn từ lần chạy trước, ví dụ do Ctrl+C không
// dừng hết `node --watch`) vẫn đang chiếm cổng đó, người dùng dễ mở nhầm cổng cũ (v.d. vẫn thấy
// "localhost:5173" quen thuộc) trong khi tiến trình MỚI thực ra đang chạy ở cổng khác — gây đúng kiểu
// nhầm lẫn "sao mở link mà không được". Giờ dùng đúng cổng cố định 5173/4000: nếu bận thì dừng hẳn
// và báo rõ ràng bằng tiếng Việt để người dùng tắt tiến trình cũ trước, thay vì âm thầm đổi cổng.
function checkPortFree(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.on('error', () => resolve(false))
    server.listen({ port, host }, () => {
      server.close(() => resolve(true))
    })
  })
}

function spawnChild(name, args, env) {
  const child = spawn(npmCmd, args, {
    env,
    stdio: 'inherit',
    shell: isWindows,
  })

  child.on('error', (error) => {
    console.error(`[${name}] Không thể khởi chạy tiến trình:`, error)
  })

  return child
}

async function main() {
  const [frontendFree, backendFree] = await Promise.all([
    checkPortFree(FRONTEND_PORT),
    checkPortFree(BACKEND_PORT),
  ])

  if (!frontendFree || !backendFree) {
    const busyPorts = [!frontendFree && FRONTEND_PORT, !backendFree && BACKEND_PORT].filter(Boolean)
    console.error(
      `[dev-all] Cổng ${busyPorts.join(', ')} đang bị chiếm bởi tiến trình khác — có thể là phiên ` +
      `"npm run dev"/"dev:all" cũ chưa tắt hẳn.`,
    )
    console.error(
      '[dev-all] Hãy đóng terminal cũ hoặc chạy `pkill -f "vite|node --watch"` (Linux/macOS) rồi thử lại, ' +
      'để chắc chắn bạn đang mở đúng phiên bản mới nhất của web.',
    )
    process.exitCode = 1
    return
  }

  const frontendOrigin = `http://localhost:${FRONTEND_PORT}`
  const backendApiBaseUrl = `http://localhost:${BACKEND_PORT}/api`

  console.log(`[dev-all] Frontend sẽ chạy tại ${frontendOrigin}`)
  console.log(`[dev-all] Backend sẽ chạy tại http://localhost:${BACKEND_PORT}`)

  const backend = spawnChild(
    'BACKEND',
    ['--prefix', 'server', 'run', 'dev'],
    {
      ...process.env,
      PORT: String(BACKEND_PORT),
      CORS_ORIGIN: process.env.CORS_ORIGIN || frontendOrigin,
    },
  )

  const frontend = spawnChild(
    'FRONTEND',
    ['run', 'dev', '--', '--port', String(FRONTEND_PORT), '--strictPort'],
    {
      ...process.env,
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || backendApiBaseUrl,
    },
  )

  let shuttingDown = false

  function shutdown(exitCode = 0) {
    if (shuttingDown) return
    shuttingDown = true
    backend.kill('SIGTERM')
    frontend.kill('SIGTERM')
    process.exitCode = exitCode
  }

  backend.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`[dev-all] Backend đã dừng (${signal || code}).`)
    shutdown(code ?? 1)
  })

  frontend.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`[dev-all] Frontend đã dừng (${signal || code}).`)
    shutdown(code ?? 1)
  })

  process.on('SIGINT', () => shutdown(0))
  process.on('SIGTERM', () => shutdown(0))
}

main().catch((error) => {
  console.error('[dev-all] Không thể khởi tạo môi trường dev:', error)
  process.exitCode = 1
})
