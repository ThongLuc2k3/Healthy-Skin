import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { useAuth } from './AuthContext'

const STORAGE_KEY = 'da_duong_profile'

export const emptyProfile = {
  skinType: '',
  allergies: [],
  conditions: [],
  goals: [],
  skinTypeNote: '',
  allergiesNote: '',
  conditionsNote: '',
  goalsNote: '',
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...emptyProfile, ...JSON.parse(raw) } : emptyProfile
  } catch {
    return emptyProfile
  }
}

export function isProfileComplete(profile) {
  return Boolean(profile?.skinType)
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfileState] = useState(loadProfile)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  // Khi đăng nhập, kéo hồ sơ đã lưu trên máy chủ về (nếu có) để dùng trên mọi thiết bị
  useEffect(() => {
    if (!user) return
    apiClient
      .get('/profile', { auth: true })
      .then((serverProfile) => {
        if (isProfileComplete(serverProfile)) {
          setProfileState(serverProfile)
        }
      })
      .catch(() => {})
  }, [user])

  function setProfile(nextProfile) {
    setProfileState(nextProfile)
    if (user) {
      apiClient.put('/profile', nextProfile, { auth: true }).catch((err) => {
        console.warn('Không thể đồng bộ hồ sơ lên máy chủ:', err.message)
      })
    }
  }

  return <ProfileContext.Provider value={{ profile, setProfile }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile phải được dùng bên trong ProfileProvider')
  return ctx
}
