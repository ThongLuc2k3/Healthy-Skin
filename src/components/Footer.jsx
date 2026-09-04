import { Link } from 'react-router-dom'

// Gộp chung 1 khung điều hướng duy nhất thay vì chia 3 cột tiêu đề riêng, footer chỉ cần lối tắt
// nhanh tới các trang, không cần phân nhóm rạch ròi như menu chính.
const FOOTER_LINKS = [
  { label: 'Hồ sơ cá nhân', to: '/profile' },
  { label: 'Quét ảnh thật AI', to: '/scan' },
  { label: 'Lịch sử quét', to: '/history' },
  { label: 'Chuyên gia tư vấn', to: '/experts' },
  { label: 'Dịch Vụ Quanh Bạn', to: '/dich-vu' },
  { label: 'Gói Trợ Lý', to: '/pricing' },
  { label: 'Dành cho chuyên gia', to: '/expert-dashboard' },
  { label: 'Quản trị', to: '/admin' },
  { label: 'Skin Lab', to: '/skin-lab' },
  { label: 'Góc truyền động lực', to: '/motivation' },
  { label: 'Diễn đàn đánh giá', to: '/reviews' },
  { label: 'Về chúng tôi', to: '/about' },
]

// 4 mục cũ ở đây từng là "Rule-Based Engine / Computer Vision / Vision Transformers / Neural
// Match Engine" trình bày như 4 link điều hướng riêng biệt, nhưng cả 4 đều trỏ chung 1 neo
// #technology, trông như 4 trang khác nhau trong khi thực chất chỉ là 1 chỗ. Đổi thành nhãn
// tĩnh (không phải link) dưới 1 CTA duy nhất để không gây hiểu nhầm.
const TECH_HIGHLIGHTS = ['Hệ thống quy tắc đối chiếu', 'Thị giác máy tính', 'Mô hình nhận diện hình ảnh', 'Công cụ đối sánh thông minh']

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-4 border-orange-500 bg-[#172554] text-white text-left">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-10" />
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo1.png"
                alt="HEALTHY SKIN Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="font-display text-xl font-extrabold text-white">
                HEALTHY<span className="text-sky-300"> SKIN</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100/75 font-normal">
              Hiểu da sâu hơn, chăm da thông minh hơn. Một nền tảng kết nối dữ liệu cá nhân, AI và chuyên gia thật.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-teal-300 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                Hệ thống đang hoạt động
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-300">
              Điều hướng nhanh
            </h4>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {FOOTER_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm font-medium text-blue-100/70 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/#technology"
            className="text-xs font-bold uppercase tracking-wider text-orange-300 hover:text-orange-200 shrink-0"
          >
            Công nghệ đang dùng ↓
          </Link>
          {TECH_HIGHLIGHTS.map((label) => (
            <span
              key={label}
              className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-semibold text-blue-100/75"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-blue-100/65">
            © 2026 HEALTHY SKIN. Cá nhân hóa chăm sóc da &amp; dinh dưỡng.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
            VẬN HÀNH BỞI CÔNG NGHỆ AI PHÂN TÍCH DA
          </p>
        </div>
      </div>
    </footer>
  )
}
