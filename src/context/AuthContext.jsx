import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient, getToken, setToken, onAuthExpired, TOKEN_KEY } from '../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }
    apiClient
      .get('/auth/me', { auth: true })
      .then(setUser)
      .catch((err) => {
        // Chỉ coi là hết phiên khi backend thật sự trả 401 (token sai/hết hạn). Lỗi mất kết nối/
        // timeout (backend chưa chạy, đang restart...) không có nghĩa token đã hỏng, giữ nguyên
        // token, không xoá, để lần tải trang sau vẫn đăng nhập được ngay khi backend sẵn sàng.
        if (err.status === 401) {
          setToken(null)
          setSessionExpired(true)
        }
      })
      .finally(() => setReady(true))
  }, [])

  async function register(email, password, acceptedTerms) {
    const data = await apiClient.post('/auth/register', { email, password, acceptedTerms })
    setToken(data.token)
    setUser(data.user)
    setSessionExpired(false)
    return data.user
  }

  async function login(email, password) {
    const data = await apiClient.post('/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    setSessionExpired(false)
    return data.user
  }

  async function loginGoogle(credential, acceptedTerms = false) {
    const data = await apiClient.post('/auth/google', { credential, acceptedTerms })
    setToken(data.token)
    setUser(data.user)
    setSessionExpired(false)
    return data.user
  }

  function logout() {
    setToken(null)
    setUser(null)
    setSessionExpired(false)
  }

  useEffect(() => onAuthExpired(TOKEN_KEY, () => {
    setUser(null)
    setSessionExpired(true)
  }), [])

  return (
    <AuthContext.Provider value={{ user, ready, sessionExpired, register, login, loginGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider')
  return ctx
}
