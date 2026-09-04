import { useEffect, useState, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import {
  UserIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  HomeIcon,
  CameraIcon,
  HistoryIcon,
  FlameIcon,
  SparklesIcon,
  StethoscopeIcon,
  ChatBubbleIcon,
  ShieldIcon,
  MapIcon,
  WalletIcon,
  ChevronDownIcon,
} from './Icons'
import { useAuth } from '../context/AuthContext'
import { apiClient, onAccountUpdated } from '../lib/apiClient'

function initialsFor(fullName, email) {
  const source = fullName?.trim() || email || ''
  if (!source) return '?'
  const parts = source.trim().split(/\s+/)
  if (fullName?.trim() && parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return source[0].toUpperCase()
}

export function AccountAvatar({ fullName, email, avatarUrl, className = 'h-8 w-8 text-xs' }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] font-bold text-white ${className}`}
    >
      {initialsFor(fullName, email)}
    </span>
  )
}

// Sắp theo nhóm chức năng thay vì thứ tự tuỳ tiện: (1) trang chủ, (2) luồng cốt lõi cá nhân
// (quét → lịch sử, đúng thứ tự người dùng thật sự đi qua), (3) nhóm kết nối/nguồn thu
// (chuyên gia, dịch vụ quanh bạn, Gói Trợ Lý, trước đây /pricing hoàn toàn vắng mặt khỏi menu
// chính, chỉ nằm khuất ở Footer), (4) nhóm giữ chân/nội dung, (5) thông tin/pháp lý luôn ở cuối.
// "Hồ sơ cá nhân" (/profile) KHÔNG lặp lại ở đây nữa, đã có sẵn dưới tên "Hồ sơ da" trong dropdown
// tài khoản (cạnh "Tài khoản của tôi"/"Đăng xuất"), để tránh 2 lối vào cùng 1 trang trên nav chính.
const LINKS = [
  { to: '/', label: 'Trang chủ', end: true, icon: HomeIcon },
  { to: '/scan', label: 'Quét thử', icon: CameraIcon },
  { to: '/history', label: 'Lịch sử', icon: HistoryIcon },
  { to: '/experts', label: 'Chuyên gia', icon: StethoscopeIcon },
  { to: '/dich-vu', label: 'Dịch Vụ Quanh Bạn', icon: MapIcon },
  { to: '/pricing', label: 'Gói Trợ Lý', icon: WalletIcon },
]

// Skin Lab, Góc truyền động lực, Diễn đàn đều là nội dung/giải trí (không thuộc luồng nghiệp vụ cốt
// lõi đặt lịch/thanh toán) nên gộp chung 1 dropdown "Cộng đồng" trên nav chính thay vì 3 tab rời,
// đỡ rối mắt, xem dropdown render riêng bên dưới, không nằm trong LINKS.
const COMMUNITY_LINKS = [
  { to: '/skin-lab', label: 'Skin Lab', icon: SparklesIcon },
  { to: '/motivation', label: 'Góc truyền động lực', icon: FlameIcon },
  { to: '/reviews', label: 'Diễn đàn', icon: ChatBubbleIcon },
]

const TAIL_LINKS = [
  { to: '/about', label: 'Về chúng tôi', icon: ShieldIcon },
]

function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [voucherCount, setVoucherCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [accountInfo, setAccountInfo] = useState(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false)
  const timeoutRef = useRef(null)
  const accountMenuRef = useRef(null)
  const communityMenuRef = useRef(null)
  const communityActive = COMMUNITY_LINKS.some((l) => location.pathname.startsWith(l.to))

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 250)
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!user) {
      setVoucherCount(0)
      setAccountInfo(null)
      return
    }
    apiClient
      .get('/vouchers/mine?onlyUnused=true', { auth: true })
      .then((vouchers) => setVoucherCount(vouchers.length))
      .catch(() => {})
    apiClient
      .get('/account', { auth: true })
      .then(setAccountInfo)
      .catch(() => {})
  }, [user])

  // Trang "Tài khoản của tôi" phát tín hiệu này sau khi lưu, nếu không nghe, dropdown ở đây vẫn
  // hiện tên/thông tin cũ (chỉ tải /account đúng 1 lần lúc đăng nhập ở effect trên) cho tới khi
  // đăng xuất/đăng nhập lại hoặc tải lại trang.
  useEffect(() => onAccountUpdated(() => {
    if (!user) return
    apiClient.get('/account', { auth: true }).then(setAccountInfo).catch(() => {})
  }), [user])

  useEffect(() => {
    function onClickOutside(e) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false)
      }
      if (communityMenuRef.current && !communityMenuRef.current.contains(e.target)) {
        setCommunityMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleLogout() {
    logout()
    setOpen(false)
    setAccountMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/92 backdrop-blur-xl ${
          scrolled ? 'border-b border-blue-100 shadow-[0_10px_35px_rgba(23,37,84,.08)]' : 'border-b border-blue-100/60'
        }`}
      >

        {/* Full-width wide container */}
          <div className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 sm:px-5 sm:py-2 lg:px-6
                ${ user ? 'lg:py-5' : 'lg:py-4'
          }`}
          >
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center gap-2 group shrink min-w-0">
            <div className="flex items-center cursor-pointer h-8 sm:h-10 shrink-0">
              <img
                src="/logo1.png"
                alt="HEALTHY SKIN Logo"
                className="h-full w-auto object-contain"
              />
            </div>
            <span className="font-display text-sm sm:text-lg font-extrabold tracking-tight text-[#172554] truncate">
              HEALTHY<span className="text-[#2563eb]"> SKIN</span>
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm transition-colors relative group ${
                    isActive ? 'text-[#1d4ed8] font-semibold' : 'text-[#172554]/70 hover:text-[#2563eb]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {l.to === '/dich-vu' && voucherCount > 0 && (
                      <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563eb] px-1 text-[10px] font-bold text-white">
                        {voucherCount}
                      </span>
                    )}
                    <span
                      className={`absolute left-3.5 right-3.5 -bottom-0.5 h-px bg-[#2563eb] transition-transform origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            <div className="relative" ref={communityMenuRef}>
              <button
                type="button"
                onClick={() => setCommunityMenuOpen((v) => !v)}
                className={`flex items-center gap-1 px-3.5 py-2 text-sm transition-colors relative group ${
                  communityActive ? 'text-[#1d4ed8] font-semibold' : 'text-[#172554]/70 hover:text-[#2563eb]'
                }`}
              >
                Cộng đồng
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${communityMenuOpen ? 'rotate-180' : ''}`} />
                <span
                  className={`absolute left-3.5 right-3.5 -bottom-0.5 h-px bg-[#2563eb] transition-transform origin-left ${
                    communityActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </button>
              <AnimatePresence>
                {communityMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-[#dbeafe] bg-white shadow-glow-lg p-2 text-sm"
                  >
                    {COMMUNITY_LINKS.map((l) => (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        onClick={() => setCommunityMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-xl px-3 py-2 ${
                            isActive ? 'bg-[#eff6ff] text-[#1d4ed8] font-semibold' : 'text-[#172554] hover:bg-[#eff6ff]'
                          }`
                        }
                      >
                        <l.icon className="h-4 w-4 text-[#2563eb]" />
                        {l.label}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {TAIL_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm transition-colors relative group ${
                    isActive ? 'text-[#1d4ed8] font-semibold' : 'text-[#172554]/70 hover:text-[#2563eb]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span
                      className={`absolute left-3.5 right-3.5 -bottom-0.5 h-px bg-[#2563eb] transition-transform origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action & Auth Section */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {user ? (
              <div className="relative hidden sm:block" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl bg-[#eff6ff] border border-[#dbeafe] px-2.5 py-1.5 text-xs text-[#172554] font-semibold hover:border-[#2563eb]/50"
                >
                  <AccountAvatar fullName={accountInfo?.fullName} email={user.email} avatarUrl={accountInfo?.avatarUrl} />
                  <span className="truncate max-w-[130px] text-[#172554]">
                    {accountInfo?.fullName || user.email}
                  </span>
                  <ChevronDownIcon className={`h-3.5 w-3.5 text-[#64748B] transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#dbeafe] bg-white shadow-glow-lg p-2 text-sm"
                    >
                      <div className="px-3 py-2 border-b border-[#eff6ff] mb-1">
                        <p className="font-bold text-[#172554] truncate">{accountInfo?.fullName || 'Chưa đặt tên'}</p>
                        <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                      </div>
                      <NavLink
                        to="/tai-khoan"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[#172554] hover:bg-[#eff6ff]"
                      >
                        <UserIcon className="h-4 w-4 text-[#2563eb]" />
                        Tài khoản của tôi
                      </NavLink>
                      <NavLink
                        to="/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[#172554] hover:bg-[#eff6ff]"
                      >
                        <SparklesIcon className="h-4 w-4 text-[#2563eb]" />
                        Hồ sơ da
                      </NavLink>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                      >
                        <LogOutIcon className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink
                to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 sm:px-5 sm:py-2.5 text-xs font-black text-white shadow-[0_8px_20px_rgba(249,115,22,.22)] hover:-translate-y-0.5 hover:bg-orange-600 transition whitespace-nowrap"
              >
                Đăng nhập
              </NavLink>
            )}

            {/* Mobile Menu Trigger button */}
            <button
              className="lg:hidden grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center text-[#1d4ed8]"
              onClick={() => setOpen((v) => !v)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
            >
              {open ? <XIcon className="h-5 w-5 text-[#1d4ed8]" /> : <MenuIcon className="h-5 w-5 text-[#1d4ed8]" />}
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          style={{ scaleX }}
          className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-gradient-to-r from-blue-600 via-teal-500 to-orange-500"
        />
      </motion.header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="fixed top-20 left-4 right-4 z-40 lg:hidden bg-white/95 backdrop-blur-2xl rounded-3xl p-4 border border-[#dbeafe] shadow-glow-lg text-[#172554]"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-sm">
              {LINKS.map((l) => {
                const Icon = l.icon
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all border ${
                        isActive
                          ? 'bg-[#eff6ff] text-[#1d4ed8] font-bold border-[#2563eb]/60'
                          : 'bg-white text-[#172554]/80 hover:text-[#1d4ed8] hover:bg-[#eff6ff] border-[#dbeafe]'
                      }`
                    }
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0 text-[#2563eb]" />}
                    <span className="truncate">{l.label}</span>
                    {l.to === '/dich-vu' && voucherCount > 0 && (
                      <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563eb] px-1 text-[10px] font-bold text-white">
                        {voucherCount}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>

            <p className="mt-4 px-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Cộng đồng</p>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-sm">
              {[...COMMUNITY_LINKS, ...TAIL_LINKS].map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-[#eff6ff] text-[#1d4ed8] font-bold border-[#2563eb]/60'
                        : 'bg-white text-[#172554]/80 hover:text-[#1d4ed8] hover:bg-[#eff6ff] border-[#dbeafe]'
                    }`
                  }
                >
                  <l.icon className="h-5 w-5 shrink-0 text-[#2563eb]" />
                  <span className="truncate">{l.label}</span>
                </NavLink>
              ))}
            </div>

            {user && (
              <div className="mt-4 pt-4 border-t border-[#dbeafe] space-y-2">
                <NavLink
                  to="/tai-khoan"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl bg-[#eff6ff] border border-[#dbeafe] px-3 py-2 text-xs"
                >
                  <AccountAvatar fullName={accountInfo?.fullName} email={user.email} avatarUrl={accountInfo?.avatarUrl} className="h-8 w-8 text-[11px]" />
                  <span className="truncate text-[#172554] font-semibold">{accountInfo?.fullName || user.email}</span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left text-rose-500 font-semibold text-xs hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

export default NavBar
