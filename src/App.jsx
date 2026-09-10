import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'

const ProfileForm = lazy(() => import('./pages/ProfileForm'))
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage'))
const ScanDemoPage = lazy(() => import('./pages/ScanDemoPage'))
const ScanHistoryPage = lazy(() => import('./pages/ScanHistoryPage'))
const MotivationPage = lazy(() => import('./pages/MotivationPage'))
const ExpertListPage = lazy(() => import('./pages/ExpertListPage'))
const ExpertApplicationPage = lazy(() => import('./pages/ExpertApplicationPage'))
const ExpertDetailPage = lazy(() => import('./pages/ExpertDetailPage'))
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ChatWidget = lazy(() => import('./components/ChatWidget'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const ExpertDashboardPage = lazy(() => import('./pages/expert/ExpertDashboardPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const ServicesNearbyPage = lazy(() => import('./pages/ServicesNearbyPage'))
const VenueApplicationPage = lazy(() => import('./pages/VenueApplicationPage'))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'))
const MyVouchersPage = lazy(() => import('./pages/MyVouchersPage'))
const SkinPlaygroundPage = lazy(() => import('./pages/SkinPlaygroundPage'))
const WebsiteReviews = lazy(() => import('./pages/WebsiteReviews'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'))

function App() {
  const { pathname } = useLocation()
  // Cổng Quản Trị (/admin) có header/tab riêng của nó, không cần NavBar/Footer/ChatWidget của trang
  // khách hàng chèn thêm vào nữa (gây rối giao diện, xem phản hồi người dùng).
  const isAdmin = pathname.startsWith('/admin')

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fbff] text-[#172554] antialiased selection:bg-blue-200 selection:text-[#172554]">
      {/* Background ambient radial glow layers matching light brand theme */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#f8fbff] via-white to-[#eff6ff]" />
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-30 mask-fade-b" />

      {!isAdmin && <NavBar />}
      <main className="relative z-10">
        <Suspense fallback={<div className="min-h-screen" aria-label="Đang tải trang" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/tai-khoan" element={<AccountSettingsPage />} />
          <Route path="/scan" element={<ScanDemoPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="/motivation" element={<MotivationPage />} />
          <Route path="/skin-lab" element={<SkinPlaygroundPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/expert-dashboard" element={<ExpertDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/dich-vu" element={<ServicesNearbyPage />} />
          <Route path="/dich-vu/dang-ky" element={<VenueApplicationPage />} />
          <Route path="/dich-vu/voucher" element={<MyVouchersPage />} />
          <Route path="/dich-vu/:id" element={<ServiceDetailPage />} />
          <Route path="/experts" element={<ExpertListPage />} />
          <Route path="/experts/dang-ky" element={<ExpertApplicationPage />} />
          <Route path="/experts/:id" element={<ExpertDetailPage />} />
          <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
          <Route path="/my-bookings/:id/chat" element={<BookingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reviews" element={<WebsiteReviews />} />
          <Route path="/nguoi-dung/:id" element={<UserProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <Suspense fallback={null}><ChatWidget /></Suspense>}
    </div>
  )
}
export default App
