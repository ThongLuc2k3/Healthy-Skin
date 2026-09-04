import { ShieldIcon, SearchIcon, SparklesIcon } from './Icons'
import { SectionTitle, Reveal } from './ui'
import NeuralNetCanvas from './NeuralNetCanvas'
import {
  FloatingCosmeticDecoration,
  SkinAnalysisIcon,
  FaceMistBottle,
  MoisturizerTube,
} from '../CosmeticDecoration'

const tech = [
  {
    name: 'Đối chiếu theo hồ sơ cá nhân',
    icon: <ShieldIcon className="h-5 w-5" />,
    desc: 'So khớp loại da, dị ứng thực phẩm và bệnh lý nền với database thành phần đã kiểm chứng, minh bạch lý do đưa ra gợi ý.',
  },
  {
    name: 'Đọc ảnh sản phẩm bằng AI',
    icon: <SearchIcon className="h-5 w-5" />,
    desc: 'Tự động đọc bảng thành phần/nhãn dinh dưỡng từ ảnh chụp thật, kèm giá tham khảo và sản phẩm liên quan.',
  },
  {
    name: 'Gợi ý, không phán quyết',
    icon: <SparklesIcon className="h-5 w-5" />,
    desc: 'Chỉ đưa ra gợi ý Phù hợp / Cần cân nhắc mang tính tham khảo, không thay thế chẩn đoán từ chuyên gia.',
  },
]

export default function Technology() {
  return (
    <section id="technology" className="relative py-24 sm:py-32 bg-gradient-to-b from-[#eff6ff] via-[#F0F6F8] to-[#eff6ff] overflow-hidden">
      {/* Soft Ambient Radial Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-10 h-96 w-96 rounded-full bg-[#60a5fa]/10 blur-3xl opacity-50" />
      </div>

      {/* Floating Cosmetic Decorations */}
      <FloatingCosmeticDecoration
        Icon={SkinAnalysisIcon}
        size="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
        className="top-4 right-2 sm:right-6 xl:-right-16 opacity-85 lg:opacity-100"
        yRange={[-28, 28, -28]}
        duration={5.2}
        delay={0.2}
        accent="#2563eb"
        parallaxOffset={65}
      />
      <FloatingCosmeticDecoration
        Icon={FaceMistBottle}
        size="w-44 h-44 sm:w-60 sm:h-60 lg:w-68 lg:h-68"
        className="top-1/2 -translate-y-1/2 right-2 sm:right-4 xl:-right-12 opacity-80 lg:opacity-95"
        yRange={[0, -30, 0]}
        duration={4.8}
        delay={0.5}
        accent="#60a5fa"
        parallaxOffset={-55}
      />
      <FloatingCosmeticDecoration
        Icon={MoisturizerTube}
        size="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
        className="bottom-4 left-2 sm:left-6 xl:-left-16 opacity-85 lg:opacity-100"
        yRange={[0, 32, 0]}
        duration={6.0}
        delay={0.8}
        accent="#6F9D8D"
        parallaxOffset={70}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
        <SectionTitle
          eyebrow="CÔNG NGHỆ & QUY TẮC"
          title={
            <>
              Hệ Thống Phân Tích
              <br />
              Minh Bạch &amp; Chính Xác.
            </>
          }
          description="Sự kết hợp giữa quy tắc kiểm tra minh bạch theo hồ sơ cá nhân và mô hình trí tuệ nhân tạo đọc ảnh sản phẩm thực tế."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-2 items-center">
          <Reveal className="lg:row-span-2 h-full">
            <div className="relative h-full min-h-[400px] overflow-hidden rounded-[28px] bg-[#FCFDFC] p-3 border border-[#E7ECEE] shadow-[0_16px_45px_rgba(47, 169, 140,0.06)]">
              {/* SaaS Window Top Control Bar */}
              <div className="flex items-center justify-between border-b border-[#E7ECEE] bg-[#eff6ff] px-5 py-3 rounded-t-[22px]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#2563eb]">
                  match_engine.active
                </div>
              </div>

              <div className="relative h-[340px] lg:h-[calc(100%-48px)] overflow-hidden rounded-b-[22px] bg-[#172554]">
                <NeuralNetCanvas />
                <div className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-[#172554]/80 backdrop-blur-md px-3.5 py-1.5 border border-[#2563eb]/30">
                  <span className="h-2 w-2 rounded-full bg-[#2563eb] animate-pulse" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                    rule-based + AI · online
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5">
            {tech.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <div className="group relative overflow-hidden rounded-[28px] bg-[#FCFDFC] p-7 transition-all duration-300 border border-[#E7ECEE] shadow-[0_8px_25px_rgba(47, 169, 140,0.04)] hover:shadow-[0_12px_35px_rgba(112, 196, 175,0.15)] hover:border-[#2563eb] hover:-translate-y-1 text-left">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 shadow-xs transition-colors group-hover:bg-[#2563eb] group-hover:text-white">
                      {t.icon}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-[#172554] group-hover:text-[#2563eb] transition-colors">
                        {t.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#64748B] font-normal">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


