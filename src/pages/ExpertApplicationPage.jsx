import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiClient } from '../lib/apiClient'
import { StethoscopeIcon, CheckCircleIcon, ArrowLeftIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const EMPTY_FORM = {
  fullName: '', specialty: '', clinicName: '', areaVi: '', bioVi: '',
  contactPhone: '', contactEmail: '', proposedFeeVnd: '', slotsText: '',
}

function ExpertApplicationPage() {
  useDocumentTitle('Đăng ký chuyên gia')
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
      await apiClient.post('/experts/apply', {
        ...form,
        proposedFeeVnd: Number(form.proposedFeeVnd),
        proposedSlots: form.slotsText.split(',').map((s) => s.trim()).filter(Boolean),
      })
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
          <h1 className="text-xl font-bold text-[#172554]">Đã gửi đơn ứng tuyển</h1>
          <p className="text-sm text-[#172554]/80 leading-relaxed">
            Đội ngũ HEALTHY SKIN sẽ xem xét hồ sơ của {form.fullName} và liên hệ qua {form.contactEmail} hoặc {form.contactPhone} trong vài ngày tới.
          </p>
          <Link
            to="/experts"
            className="mt-2 inline-block rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#172554]"
          >
            Quay lại danh sách chuyên gia
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eff6ff] via-[#FCFDFC] to-[#eff6ff] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[700px]">
        <Link to="/experts" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#2563eb]">
          <ArrowLeftIcon className="h-4 w-4" />
          Chuyên gia tư vấn
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 text-center space-y-3"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#60a5fa]/15 text-[#2563eb]">
            <StethoscopeIcon className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-[#172554]">
            Đăng ký làm chuyên gia
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#64748B]">
            Bạn là bác sĩ da liễu hoặc chuyên gia dinh dưỡng? Đăng ký để tư vấn 1-1 với người dùng HEALTHY SKIN.
            Bạn tự đề xuất mức phí tư vấn và khung giờ rảnh phù hợp với lịch làm việc của mình.
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[28px] border border-[#dbeafe] bg-white p-8 shadow-xs space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Họ và tên</label>
              <input
                required
                placeholder="BS. Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Chuyên khoa</label>
              <input
                required
                placeholder="Da liễu, Dinh dưỡng..."
                value={form.specialty}
                onChange={(e) => update('specialty', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Phòng khám / nơi công tác</label>
              <input
                required
                value={form.clinicName}
                onChange={(e) => update('clinicName', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
            </div>
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
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Giới thiệu bản thân</label>
            <textarea
              required
              rows={3}
              placeholder="Số năm kinh nghiệm, thế mạnh chuyên môn..."
              value={form.bioVi}
              onChange={(e) => update('bioVi', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Số điện thoại</label>
              <input
                required
                value={form.contactPhone}
                onChange={(e) => update('contactPhone', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
              />
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
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Mức phí tư vấn mong muốn (VNĐ / buổi)</label>
            <input
              required
              type="number"
              min="1"
              placeholder="VD: 350000"
              value={form.proposedFeeVnd}
              onChange={(e) => update('proposedFeeVnd', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[#64748B]">Bạn tự quyết định mức phí, không bắt buộc theo giá thị trường.</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Khung giờ rảnh</label>
            <input
              required
              placeholder="VD: Thứ 2 - 19:00, Thứ 5 - 09:00"
              value={form.slotsText}
              onChange={(e) => update('slotsText', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[#64748B]">Cách nhau bởi dấu phẩy, theo mẫu "Thứ X - HH:MM".</p>
          </div>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#2563eb] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-[#172554] disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ExpertApplicationPage
