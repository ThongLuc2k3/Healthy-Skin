import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiClient } from '../lib/apiClient'
import { MapIcon, CheckCircleIcon, ArrowLeftIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const CATEGORY_OPTIONS = ['spa', 'phòng khám', 'gym', 'xông hơi', 'khác']

const EMPTY_FORM = {
  businessName: '', category: 'spa', contactName: '', contactPhone: '', contactEmail: '',
  areaVi: '', addressVi: '', descriptionVi: '',
}

function VenueApplicationPage() {
  useDocumentTitle('Đăng ký đối tác')
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await apiClient.post('/venues/apply', form)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto mt-24 max-w-lg px-4 py-12">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-600" />
          <h1 className="text-xl font-bold text-[#172554]">Đã gửi đơn đăng ký</h1>
          <p className="text-sm text-[#172554]/80 leading-relaxed">
            Đội ngũ HEALTHY SKIN sẽ xem xét hồ sơ của {form.businessName} và liên hệ qua {form.contactEmail} hoặc {form.contactPhone} trong vài ngày tới.
          </p>
          <Link
            to="/dich-vu"
            className="mt-2 inline-block rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#172554]"
          >
            Quay lại Dịch Vụ Quanh Bạn
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[700px]">
        <Link to="/dich-vu" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#2563eb]">
          <ArrowLeftIcon className="h-4 w-4" />
          Dịch Vụ Quanh Bạn
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 text-center space-y-3"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#60a5fa]/15 text-[#2563eb]">
            <MapIcon className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-[#172554]">
            Đăng ký làm đối tác
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#64748B]">
            Đưa spa, phòng khám, gym hoặc cơ sở xông hơi của bạn lên HEALTHY SKIN. Đội ngũ quản trị sẽ xem xét và liên hệ sau khi bạn gửi đơn.
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[28px] border border-[#dbeafe] bg-white p-8 shadow-xs space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Tên cơ sở</label>
              <input
                required
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Loại hình</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Người liên hệ</label>
              <input
                required
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Số điện thoại</label>
              <input
                required
                value={form.contactPhone}
                onChange={(e) => update('contactPhone', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Email liên hệ</label>
            <input
              required
              type="email"
              value={form.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Khu vực</label>
              <input
                required
                placeholder="VD: Quận 1, TP.HCM"
                value={form.areaVi}
                onChange={(e) => update('areaVi', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Địa chỉ đầy đủ</label>
              <input
                required
                value={form.addressVi}
                onChange={(e) => update('addressVi', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Giới thiệu ngắn</label>
            <textarea
              required
              rows={3}
              value={form.descriptionVi}
              onChange={(e) => update('descriptionVi', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
            />
          </div>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#2563eb] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-[#172554] disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VenueApplicationPage
