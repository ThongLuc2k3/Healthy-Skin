import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiClient } from '../lib/apiClient'
import { SectionTitle } from './ui'
import { MapIcon } from './Icons'

export default function ServicesHighlight() {
  const [venues, setVenues] = useState([])

  useEffect(() => {
    apiClient.get('/venues').then((data) => setVenues(data.slice(0, 4))).catch(() => {})
  }, [])

  if (venues.length === 0) return null

  return (
    <section id="services-highlight" className="relative py-24 sm:py-28 bg-[#eff6ff]">
      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
        <SectionTitle
          eyebrow="DỊCH VỤ QUANH BẠN"
          title={
            <>
              Spa, phòng khám, gym...
              <br />
              đặt chỗ ngay, có voucher giảm giá.
            </>
          }
          description="Trung tâm đối tác với giá cố định do chính họ niêm yết. Web chỉ là trung gian đặt chỗ và ăn hoa hồng."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {venues.map((venue, i) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Link
                to={`/dich-vu/${venue.id}`}
                className="group flex h-full flex-col rounded-2xl border border-[#E7ECEE] bg-white p-5 text-left transition hover:border-[#2563eb] hover:shadow-md"
              >
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#2563eb]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2563eb]">
                  {venue.category}
                </span>
                <h3 className="mt-3 font-bold text-[#172554] group-hover:text-[#2563eb]">{venue.name}</h3>
                <p className="mt-1 text-xs text-[#64748B]">{venue.areaVi}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dich-vu"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#172554]"
          >
            <MapIcon className="h-4 w-4" />
            Khám phá Dịch Vụ Quanh Bạn
          </Link>
          <Link
            to="/dich-vu/voucher"
            className="inline-flex items-center gap-2 rounded-full border border-[#2563eb]/30 px-7 py-3 text-sm font-bold text-[#2563eb] transition hover:bg-[#2563eb]/10"
          >
            Xem Kho Voucher
          </Link>
        </div>
      </div>
    </section>
  )
}
