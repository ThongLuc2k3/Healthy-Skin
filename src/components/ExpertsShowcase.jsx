import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiClient } from '../lib/apiClient'
import { SectionTitle } from './ui'
import { StethoscopeIcon, StarIcon, ArrowLeftIcon } from '../components/Icons'

function formatFee(feeVnd) {
  if (!feeVnd) return 'Liên hệ để biết giá'
  return `${feeVnd.toLocaleString('vi-VN')}đ / buổi`
}

export default function ExpertsShowcase() {
  const [experts, setExperts] = useState([])

  useEffect(() => {
    apiClient.get('/experts').then((data) => setExperts(data.slice(0, 3))).catch(() => {})
  }, [])

  if (experts.length === 0) return null

  return (
    <section id="experts-showcase" className="relative py-24 sm:py-28 bg-gradient-to-b from-[#eff6ff] via-white to-[#eff6ff]">
      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
        <SectionTitle
          eyebrow="KẾT NỐI CHUYÊN GIA"
          title={
            <>
              Cần khám thật?
              <br />
              Gặp bác sĩ, không chỉ hỏi AI.
            </>
          }
          description="Việc chẩn đoán và tư vấn điều trị thuộc về chuyên gia thật, không phải Trợ Lý. Giá tư vấn minh bạch, đặt lịch ngay dưới đây."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {experts.map((expert, i) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link
                to={`/experts/${expert.id}`}
                className="group flex h-full flex-col rounded-[26px] border border-[#E7ECEE] bg-white p-6 text-left shadow-[0_10px_30px_rgba(47, 169, 140,0.05)] transition hover:border-[#2563eb] hover:shadow-[0_16px_40px_rgba(47, 169, 140,0.12)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#60a5fa] to-[#6F9D8D] text-white">
                  <StethoscopeIcon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-[#172554] group-hover:text-[#2563eb]">
                  {expert.name}
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">{expert.specialty} · {expert.clinic_name}</p>
                <div className="mt-3 flex items-center gap-1.5 text-amber-500">
                  <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-[#172554]">{expert.rating_avg.toFixed(1)}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-[#2563eb]">{formatFee(expert.consultation_fee_vnd)}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb]">
                  Xem hồ sơ &amp; đặt lịch
                  <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          to="/experts"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#172554] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#2563eb]"
        >
          Xem tất cả chuyên gia
        </Link>
      </div>
    </section>
  )
}
