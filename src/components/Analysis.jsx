import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserIcon,
  SearchIcon,
  PlayIcon,
  GamepadIcon,
  ChatBubbleIcon,
  MapIcon,
  ArrowLeftIcon,
} from './Icons'
import { SectionTitle } from './ui'
import {
  FloatingCosmeticDecoration,
  SerumDropper,
  CreamJar,
  SunscreenTube,
  JadeRoller,
} from '../CosmeticDecoration'

const FEATURES = [
  {
    icon: UserIcon,
    title: 'Một hồ sơ cá nhân duy nhất',
    desc: 'Khai báo loại da, dị ứng thực phẩm, bệnh lý nền và mục tiêu một lần, dùng chung cho cả chăm sóc da lẫn dinh dưỡng. Không chắc thì chọn "Khác" và mô tả để AI hiểu rõ hơn.',
    to: '/profile',
    tag: 'Core Profile',
    accent: 'from-[#2563eb]/20 to-[#60a5fa]/10',
    featured: true,
  },
  {
    icon: SearchIcon,
    title: 'Quét thử nhanh',
    desc: 'Tìm thủ công hoặc quét ảnh thật bằng AI để xem gợi ý phù hợp, giá tham khảo và sản phẩm liên quan.',
    to: '/scan',
    tag: 'AI Scan',
    accent: 'from-[#60a5fa]/20 to-[#2563eb]/10',
  },
  {
    icon: PlayIcon,
    title: 'Góc truyền động lực',
    desc: 'Video & nội dung ngắn về skincare, dinh dưỡng, giảm cân lành mạnh, giữ động lực trên hành trình của bạn.',
    to: '/motivation',
    tag: 'Motivation',
    accent: 'from-[#BFD8CF]/25 to-[#6F9D8D]/15',
  },
  {
    icon: GamepadIcon,
    title: 'Skin Lab vui nhộn',
    desc: 'Mini quiz và thử thách nho nhỏ để người dùng quay lại mỗi ngày, giúp app giống một hệ sinh thái sống động hơn.',
    to: '/skin-lab',
    tag: 'Mini Games',
    accent: 'from-[#60a5fa]/20 to-[#BFD8CF]/15',
  },
  {
    icon: ChatBubbleIcon,
    title: 'Trợ Lý hỏi nhanh',
    desc: 'Vài câu hỏi cơ bản mỗi ngày là miễn phí, hỏi sâu hơn thì Trợ Lý sẽ gợi ý đặt lịch chuyên gia thay vì tự đoán.',
    to: '/pricing',
    tag: 'Trợ Lý',
    accent: 'from-[#2563eb]/20 to-[#60a5fa]/10',
  },
  {
    icon: MapIcon,
    title: 'Dịch Vụ Quanh Bạn',
    desc: 'Đặt spa, phòng khám, gym... tại trung tâm đối tác với giá cố định, áp voucher từ Kho Voucher để giảm giá.',
    to: '/dich-vu',
    tag: 'Đặt dịch vụ',
    accent: 'from-[#D8B27A]/20 to-[#A87A45]/10',
  },
]

function FeatureTiltCard({ feature, index }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -py * 10, ry: px * 12 })
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0 })
  }

  const IconComp = feature.icon
  const isFeatured = feature.featured

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`perspective-1000 ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      <Link
        to={feature.to}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className={`group preserve-3d relative flex flex-col justify-between h-full overflow-hidden rounded-[28px] bg-[#FCFDFC] p-8 text-left border border-[#E7ECEE] shadow-[0_10px_35px_rgba(47, 169, 140,0.04)] transition-all duration-300 hover:border-[#2563eb] hover:shadow-[0_16px_45px_rgba(112, 196, 175,0.18)] hover:-translate-y-1.5 ${
          isFeatured ? 'p-10 bg-gradient-to-br from-[#FCFDFC] via-white to-[#60a5fa]/10' : ''
        }`}
      >
        {/* Animated Gradient Spotlight Underlay */}
        <div
          className={`pointer-events-none absolute -inset-px rounded-[28px] bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        <div className="relative preserve-3d z-10" style={{ transform: 'translateZ(30px)' }}>
          <div className="flex items-center justify-between">
            <span
              className={`flex items-center justify-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2563eb] group-hover:text-white group-hover:shadow-md ${
                isFeatured ? 'h-14 w-14' : 'h-12 w-12'
              }`}
            >
              <IconComp className={isFeatured ? 'h-7 w-7' : 'h-6 w-6'} />
            </span>
            <span className="font-mono text-[11px] font-bold text-[#2563eb] uppercase tracking-wider bg-[#eff6ff] px-3.5 py-1.5 rounded-full border border-[#E7ECEE]">
              {feature.tag}
            </span>
          </div>

          <h3
            className={`mt-6 font-display font-extrabold text-[#172554] group-hover:text-[#2563eb] transition-colors ${
              isFeatured ? 'text-2xl sm:text-3xl' : 'text-xl'
            }`}
          >
            {feature.title}
          </h3>
          <p
            className={`mt-3 leading-relaxed text-[#64748B] font-normal ${
              isFeatured ? 'text-base sm:text-lg max-w-xl' : 'text-sm'
            }`}
          >
            {feature.desc}
          </p>
        </div>

        <div className="relative preserve-3d z-10 mt-8 flex items-center gap-2 text-xs font-bold text-[#2563eb] group-hover:text-[#172554] transition-colors">
          Khám phá ngay <ArrowLeftIcon className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1.5" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function Analysis() {
  return (
    <section id="analysis" className="relative py-24 sm:py-32 bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] overflow-hidden">
      {/* Soft Ambient Radial Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#60a5fa]/10 blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#BFD8CF]/15 blur-3xl opacity-50" />
      </div>

      {/* Animated Floating Cosmetic Decorations */}
      <FloatingCosmeticDecoration
        Icon={SerumDropper}
        size="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
        className="top-6 left-2 sm:left-4 xl:-left-16 opacity-85 lg:opacity-100"
        yRange={[0, -32, 0]}
        duration={5.5}
        delay={0.2}
        accent="#2563eb"
        parallaxOffset={70}
      />
      <FloatingCosmeticDecoration
        Icon={CreamJar}
        size="w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
        className="top-4 right-2 sm:right-4 xl:-right-20 opacity-85 lg:opacity-100"
        yRange={[-28, 28, -28]}
        duration={5.0}
        delay={0.4}
        accent="#60a5fa"
        parallaxOffset={-65}
      />
      <FloatingCosmeticDecoration
        Icon={SunscreenTube}
        size="w-44 h-44 sm:w-60 sm:h-60 lg:w-72 lg:h-72"
        className="bottom-8 right-2 sm:right-6 xl:-right-12 opacity-80 lg:opacity-95"
        yRange={[0, -35, 0]}
        duration={6.0}
        delay={0.6}
        accent="#D8B27A"
        parallaxOffset={60}
      />
      <FloatingCosmeticDecoration
        Icon={JadeRoller}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
        className="bottom-4 left-2 sm:left-6 xl:-left-12 opacity-80 lg:opacity-95"
        yRange={[-25, 25, -25]}
        duration={6.5}
        delay={0.8}
        accent="#6F9D8D"
        parallaxOffset={-55}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
        <SectionTitle
          eyebrow="HỆ SINH THÁI CÁ NHÂN HÓA"
          title={
            <>
              Hệ sinh thái HEALTHY SKIN
              <br />
              toàn diện &amp; thông minh.
            </>
          }
          description="Được thiết kế dựa trên một hồ sơ cá nhân dùng chung cho cả chăm sóc da và dinh dưỡng, giúp bạn biết rõ sản phẩm hay thực phẩm nào phù hợp với chính mình."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {FEATURES.map((f, i) => (
            <FeatureTiltCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}


