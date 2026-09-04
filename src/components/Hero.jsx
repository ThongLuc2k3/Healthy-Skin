import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CameraIcon, SparklesIcon, ShieldIcon, StethoscopeIcon } from './Icons'
import { useAuth } from '../context/AuthContext'

const QUICK_STATS = [
  ['01', 'Hồ sơ chung', 'Cá nhân hóa xuyên suốt'],
  ['AI', 'Quét thông minh', 'Đọc nhãn trong vài giây'],
  ['24/7', 'Agent hỗ trợ', 'Có RAG và 10 công cụ'],
]

export default function Hero() {
  const { user } = useAuth()
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden bg-[#f8fbff] pt-24">
      <div className="absolute inset-0 grid-bg opacity-55 mask-fade-b" />
      <div className="absolute -left-32 top-16 h-96 w-96 rounded-full bg-blue-300/35 blur-3xl animate-blob1" />
      <div className="absolute -right-24 top-44 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl animate-blob2" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-6rem)] max-w-[1280px] items-center gap-8 px-4 py-14 lg:grid-cols-[1.18fr_.82fr] lg:px-5 xl:gap-12">
        <div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-blue-700 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white"><SparklesIcon className="h-3.5 w-3.5" /></span>
            Làn da khỏe bắt đầu từ lựa chọn đúng
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="mt-7 max-w-4xl text-[clamp(2.55rem,4.15vw,4.75rem)] font-black leading-[.98] tracking-[-.055em] text-[#172554]">
            <span className="block lg:whitespace-nowrap">Hiểu da sâu hơn.</span><span className="mt-2 block lg:whitespace-nowrap text-gradient-logo">Chăm da thông minh hơn.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-slate-600">
            Kết nối hồ sơ cá nhân, quét sản phẩm, trợ lý AI có nguồn và chuyên gia thật trong một hành trình chăm sóc dành riêng cho bạn.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={user ? '/scan' : '/profile'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,.25)] transition hover:-translate-y-1 hover:bg-blue-700"><CameraIcon className="h-5 w-5" /> {user ? 'Quét sản phẩm ngay' : 'Tạo hồ sơ miễn phí'}</Link>
            <Link to="/experts" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-[#172554] shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:text-blue-700"><StethoscopeIcon className="h-5 w-5 text-teal-600" /> Tìm chuyên gia</Link>
          </motion.div>
          <div className="mt-11 grid max-w-2xl grid-cols-3 border-t border-slate-200 pt-6">
            {QUICK_STATS.map(([value, label, detail]) => <div key={label} className="border-r border-slate-200 pr-3 last:border-0 last:pl-4 sm:px-4 sm:first:pl-0"><strong className="block text-xl font-black text-blue-600 sm:text-2xl">{value}</strong><span className="mt-1 block text-xs font-extrabold text-[#172554] sm:text-sm">{label}</span><span className="mt-1 hidden text-xs text-slate-500 sm:block">{detail}</span></div>)}
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: 30, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ delay: .15, duration: .7 }} className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute -left-5 -top-5 h-24 w-24 rounded-3xl bg-orange-500" /><div className="absolute -bottom-5 -right-5 h-32 w-32 rounded-full bg-teal-400" />
          <div className="relative overflow-hidden rounded-[2rem] border border-blue-200 bg-white p-5 shadow-[0_28px_80px_rgba(23,37,84,.16)] sm:p-7">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white"><SparklesIcon className="h-6 w-6" /></div><div><p className="text-sm font-black text-[#172554]">Healthy Skin Agent</p><p className="text-xs font-medium text-teal-600">Đang kết nối dữ liệu cá nhân</p></div></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-700">Online</span></div>
            <div className="mt-8 rounded-2xl bg-blue-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Phân tích nhanh</p><p className="mt-2 text-lg font-black text-[#172554]">Da nhạy cảm · ưu tiên phục hồi</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-4/5 rounded-full bg-gradient-to-r from-blue-600 via-teal-500 to-orange-400" /></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white p-3"><ShieldIcon className="h-5 w-5 text-blue-600" /><p className="mt-2 text-xs font-extrabold">Đối chiếu hồ sơ</p></div><div className="rounded-xl bg-white p-3"><CameraIcon className="h-5 w-5 text-orange-500" /><p className="mt-2 text-xs font-extrabold">Đọc bảng thành phần</p></div></div></div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 p-4"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-500" /><p className="text-sm font-medium leading-relaxed text-slate-600"><strong className="text-[#172554]">Gợi ý có căn cứ.</strong> Agent tra cứu kho kiến thức RAG và hiển thị nguồn ngay trong câu trả lời.</p></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
