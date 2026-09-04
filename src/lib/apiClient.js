const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'da_duong_token'
const EXPERT_TOKEN_KEY = 'da_duong_expert_token'
const ADMIN_TOKEN_KEY = 'da_duong_admin_token'
const REQUEST_TIMEOUT_MS = 15_000
export const AI_REQUEST_TIMEOUT_MS = 120_000

export { TOKEN_KEY, EXPERT_TOKEN_KEY, ADMIN_TOKEN_KEY }

// Lắng nghe sự kiện phiên hết hạn cho đúng 1 loại token (user/expert/admin), trả về hàm huỷ đăng ký
// để gọi trong cleanup của useEffect, tránh phải nhớ tự viết addEventListener/removeEventListener
// với so sánh e.detail.tokenKey ở từng trang.
export function onAuthExpired(tokenKey, callback) {
  function handler(e) {
    if (e.detail?.tokenKey === tokenKey) callback()
  }
  window.addEventListener('auth:expired', handler)
  return () => window.removeEventListener('auth:expired', handler)
}

// Báo cho các thành phần khác (NavBar...) biết thông tin tài khoản vừa đổi ở trang "Tài khoản của
// tôi", NavBar chỉ tải /account 1 lần lúc đăng nhập nên không tự thấy thay đổi nếu không có tín
// hiệu này, dẫn tới hiện tên/thông tin cũ dù đã lưu thành công.
export function notifyAccountUpdated() {
  window.dispatchEvent(new CustomEvent('account:updated'))
}

export function onAccountUpdated(callback) {
  window.addEventListener('account:updated', callback)
  return () => window.removeEventListener('account:updated', callback)
}

export function notifyChatWalletUpdated(wallet) {
  window.dispatchEvent(new CustomEvent('chat:wallet-updated', { detail: wallet }))
}

export function onChatWalletUpdated(callback) {
  function handler(event) { callback(event.detail) }
  window.addEventListener('chat:wallet-updated', handler)
  return () => window.removeEventListener('chat:wallet-updated', handler)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// Token riêng cho Expert Dashboard (đăng nhập chuyên gia demo), tách khỏi token người dùng
// thường để một trình duyệt có thể vừa đăng nhập tài khoản cá nhân vừa mở dashboard chuyên gia.
export function getExpertToken() {
  return localStorage.getItem(EXPERT_TOKEN_KEY)
}

export function setExpertToken(token) {
  if (token) {
    localStorage.setItem(EXPERT_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(EXPERT_TOKEN_KEY)
  }
}

// Token riêng cho trang Admin, tách khỏi token người dùng/chuyên gia, cùng lý do với EXPERT_TOKEN_KEY.
export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  }
}

async function request(path, { method = 'GET', body, isFormData = false, auth = false, tokenKey = TOKEN_KEY, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const headers = {}
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = localStorage.getItem(tokenKey)
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      signal: controller.signal,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      const err = new Error('Máy chủ phản hồi quá chậm hoặc không phản hồi. Kiểm tra backend rồi thử lại.')
      err.timeout = true
      throw err
    }
    const err = new Error('Không thể kết nối tới máy chủ. Backend có thể chưa chạy hoặc bị chặn do cấu hình mạng/CORS.')
    err.offline = true
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    // Token hết hạn/không hợp lệ trên 1 request có auth, xoá token cũ và báo cho phần UI đang
    // hiển thị (AdminDashboardPage, ExpertDashboardPage, AuthContext...) tự quay về màn hình đăng
    // nhập NGAY, thay vì phải người dùng tự bấm "Đăng xuất" khi thấy lỗi "phiên hết hạn" đứng im.
    if (auth && response.status === 401) {
      localStorage.removeItem(tokenKey)
      window.dispatchEvent(new CustomEvent('auth:expired', { detail: { tokenKey } }))
    }
    const err = new Error(data?.error || 'Đã có lỗi xảy ra, vui lòng thử lại.')
    err.status = response.status
    throw err
  }

  return data
}

// Ảnh điểm danh yêu cầu xác thực (không phải static công khai) nên <img src> thường
// không gửi được header Authorization, tải về dạng blob rồi tạo object URL để hiển thị.
export async function fetchAuthedBlobUrl(path) {
  const token = getToken()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch (error) {
    clearTimeout(timeoutId)
    if (error?.name === 'AbortError') {
      throw new Error('Tải file quá chậm hoặc không phản hồi.')
    }
    throw new Error('Không tải được file từ máy chủ.')
  }
  clearTimeout(timeoutId)
  if (!response.ok) throw new Error('Không tải được ảnh.')
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function openAuthedFile(path) {
  const blobUrl = await fetchAuthedBlobUrl(path)
  window.open(blobUrl, '_blank', 'noopener,noreferrer')
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

// Dùng cho Expert Dashboard, giống apiClient nhưng luôn gắn token chuyên gia (EXPERT_TOKEN_KEY).
// Gửi kèm token ở mọi request kể cả endpoint công khai (server bỏ qua nếu không cần) để tránh
// phải nhớ truyền auth:true ở từng lời gọi.
export const expertApiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET', auth: true, tokenKey: EXPERT_TOKEN_KEY }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body, auth: true, tokenKey: EXPERT_TOKEN_KEY }),
}

// Dùng cho trang Admin, luôn gắn token quản trị (ADMIN_TOKEN_KEY), cùng cách expertApiClient hoạt động.
export const adminApiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET', auth: true, tokenKey: ADMIN_TOKEN_KEY }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body, auth: true, tokenKey: ADMIN_TOKEN_KEY }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body, auth: true, tokenKey: ADMIN_TOKEN_KEY }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE', auth: true, tokenKey: ADMIN_TOKEN_KEY }),
}
