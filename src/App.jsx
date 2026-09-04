import { Routes, Route, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProfileForm from './pages/ProfileForm'
import AccountSettingsPage from './pages/AccountSettingsPage'
import ScanDemoPage from './pages/ScanDemoPage'
import ScanHistoryPage from './pages/ScanHistoryPage'
import MotivationPage from './pages/MotivationPage'
import ExpertListPage from './pages/ExpertListPage'
import ExpertApplicationPage from './pages/ExpertApplicationPage'
import ExpertDetailPage from './pages/ExpertDetailPage'
import BookingDetailPage from './pages/BookingDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatWidget from './components/ChatWidget'
import PricingPage from './pages/PricingPage'
import ExpertDashboardPage from './pages/expert/ExpertDashboardPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import ServicesNearbyPage from './pages/ServicesNearbyPage'
import VenueApplicationPage from './pages/VenueApplicationPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import MyVouchersPage from './pages/MyVouchersPage'
import SkinPlaygroundPage from './pages/SkinPlaygroundPage'
import WebsiteReviews from './pages/WebsiteReviews'
import AboutPage from './pages/AboutPage'
import UserProfilePage from './pages/UserProfilePage'

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
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <ChatWidget />}
    </div>
  )
}
export default App
