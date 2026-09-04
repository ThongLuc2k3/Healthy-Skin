import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, ShieldIcon } from './Icons'
import { Reveal } from './ui'
import {
  FloatingCosmeticDecoration,
  CreamJar,
  SerumDropper,
  PerfumeBottle,
  SunscreenTube,
} from '../CosmeticDecoration'

export default function CTA() {
  return (
    <section id="cta" className="relative py-24 sm:py-32 bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] overflow-hidden">
      {/* Soft Ambient Radial Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#60a5fa]/12 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
      </div>

      {/* Floating Cosmetic Decorations */}
      <FloatingCosmeticDecoration
        Icon={CreamJar}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-4 left-1 sm:left-6 xl:left-12 opacity-85 lg:opacity-100"
        yRange={[-28, 28, -28]}
        duration={5.0}
        delay={0.2}
        accent="#60a5fa"
        parallaxOffset={-70}
      />
      <FloatingCosmeticDecoration
        Icon={SerumDropper}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-68 lg:h-68"
        className="bottom-4 left-2 sm:left-10 xl:left-20 opacity-80 lg:opacity-95"
        yRange={[22, -22, 22]}
        duration={4.6}
        delay={0.4}
        accent="#2563eb"
        parallaxOffset={60}
      />
      <FloatingCosmeticDecoration
        Icon={PerfumeBottle}
        size="w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80"
        className="top-4 right-1 sm:right-6 xl:right-12 opacity-85 lg:opacity-100"
        yRange={[28, -28, 28]}
        duration={5.4}
        delay={0.3}
        accent="#D8B27A"
        parallaxOffset={70}
      />
      <FloatingCosmeticDecoration
        Icon={SunscreenTube}
        size="w-44 h-44 sm:w-56 sm:h-56 lg:w-68 lg:h-68"
        className="bottom-4 right-2 sm:right-10 xl:right-20 opacity-80 lg:opacity-95"
        yRange={[-24, 24, -24]}
        duration={4.8}
        delay={0.5}
        accent="#6F9D8D"
        parallaxOffset={-60}
      />

      <div className="relative mx-auto max-w-[1000px] px-6 text-center">
        <Reveal delay={0.08}>
          <div className="rounded-[36px] border border-[#E7ECEE] bg-[#FCFDFC]/90 p-10 sm:p-16 backdrop-blur-xl shadow-[0_16px_50px_rgba(47, 169, 140,0.06)]">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-[#172554]">
              Đúng da, đúng dưỡng chất.
              <br />
              <span className="text-[#2563eb]">Từ trong ra ngoài.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#64748B] leading-relaxed font-normal">
              Chỉ cần khai báo loại da, dị ứng và mục tiêu một lần để nhận ngay gợi ý sản phẩm mỹ phẩm &amp; thực phẩm phù hợp với chính bạn.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/profile"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#6F9D8D] px-9 py-4 text-sm font-bold text-white shadow-[0_8px_25px_rgba(112, 196, 175,0.35)] transition-all"
                >
                  Bắt đầu khai báo hồ sơ
                  <ArrowLeftIcon className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E7ECEE] px-8 py-4 text-sm font-bold text-[#172554] shadow-xs transition-all hover:bg-[#eff6ff] hover:border-[#2563eb]"
              >
                Thử quét sản phẩm
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-[#64748B]">
              <span className="inline-flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-[#6F9D8D]" />
                Minh bạch lý do phân loại
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-[#6F9D8D]" />
                Lưu trữ hồ sơ cá nhân bảo mật
              </span>
            </div>

            <p className="mt-6 text-xs text-[#64748B]/80 max-w-2xl mx-auto font-normal">
              Gợi ý theo hồ sơ dựa trên quy tắc (rule-based), minh bạch lý do. Quét ảnh thật (AI) là tính năng bổ sung dành cho tài khoản đã đăng nhập.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

