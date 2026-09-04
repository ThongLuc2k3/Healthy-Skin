import { Fragment, useEffect, useState } from 'react'
import { adminApiClient, getAdminToken, setAdminToken, onAuthExpired, ADMIN_TOKEN_KEY } from '../../lib/apiClient'
import { formatVnd, formatDate, formatDateTime } from '../../lib/format'
import {
  ShieldIcon, WalletIcon, UserIcon, StethoscopeIcon, MapIcon, SparklesIcon,
  CheckCircleIcon, XCircleIcon, LogOutIcon, TrashIcon, HistoryIcon, LockIcon,
} from '../../components/Icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const TRANSACTION_PURPOSE_LABELS = {
  wallet_topup: 'Nạp ví',
  plan_purchase: 'Mua gói Trợ Lý',
  venue_deposit: 'Đặt cọc dịch vụ',
}

const ACTIVITY_TYPE_LABELS = {
  deposit: 'Nạp ví',
  plan_purchase: 'Mua gói',
  venue_deposit: 'Đặt cọc dịch vụ',
  expert_booking: 'Đặt lịch chuyên gia',
  venue_booking: 'Đặt dịch vụ đối tác',
  review_post: 'Đăng đánh giá (Diễn đàn)',
  motivation_post: 'Đăng bài (Truyền động lực)',
  expert_chat: 'Mở tư vấn chuyên gia',
}

const PLACEMENT_OPTIONS = [
  { key: 'trang_chu', label: 'Trang chủ' },
  { key: 'ket_qua_quet', label: 'Kết quả quét sản phẩm' },
  { key: 'tu_van_chuyen_gia', label: 'Chat tư vấn chuyên gia' },
]

function AdminLoginForm({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await adminApiClient.post('/admin/login', { email, password })
      setAdminToken(data.token)
      onLoggedIn(data.admin)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative mx-auto mt-28 max-w-md overflow-hidden rounded-[2rem] border border-blue-200 bg-white p-8 shadow-[0_24px_70px_rgba(23,37,84,.16)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-orange-500" />
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
          <ShieldIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#172554]">Cổng Quản Trị</h1>
          <p className="text-xs text-[#64748B]">Đăng nhập tài khoản quản trị</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email quản trị"
          className="w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_10px_30px_rgba(23,37,84,.06)] transition hover:-translate-y-1 hover:border-blue-300">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-2xl font-black text-[#172554]">{value}</p>
      <p className="mt-0.5 text-xs text-[#64748B]">{label}</p>
    </div>
  )
}

function OverviewTab() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApiClient.get('/admin/overview').then(setData).catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="text-sm text-rose-600">{error}</p>
  if (!data) return <p className="text-sm text-[#64748B]">Đang tải...</p>

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={WalletIcon} label="Doanh thu nạp ví & mua gói" value={formatVnd(data.paymentRevenueTotalVnd)} />
        <StatCard icon={WalletIcon} label="Tổng doanh thu booking (gross)" value={formatVnd(data.grossTotalVnd)} />
        <StatCard icon={WalletIcon} label="Hoa hồng nền tảng" value={formatVnd(data.commissionTotalVnd)} />
        <StatCard icon={UserIcon} label="Thành viên" value={data.memberCount} />
        <StatCard icon={StethoscopeIcon} label="Chuyên gia" value={data.expertCount} />
        <StatCard icon={MapIcon} label="Trung tâm đối tác" value={data.venueCount} />
        <StatCard icon={MapIcon} label="Đơn đối tác chờ duyệt" value={data.pendingVenueApplications} />
        <StatCard icon={CheckCircleIcon} label="Lịch hẹn chuyên gia" value={data.expertBookingCount} />
        <StatCard icon={CheckCircleIcon} label="Lượt đặt dịch vụ" value={data.venueBookingCount} />
      </div>

      <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-xs overflow-x-auto">
        <h3 className="text-sm font-bold text-[#172554]">Doanh thu theo loại thanh toán (ví &amp; gói)</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-[#64748B]">
              <th className="py-2 pr-4">Loại</th>
              <th className="py-2 pr-4">Số giao dịch</th>
              <th className="py-2 pr-4">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.paymentByPurpose || {}).map(([purpose, stat]) => (
              <tr key={purpose} className="border-t border-[#eff6ff]">
                <td className="py-2 pr-4 font-semibold text-[#172554]">{TRANSACTION_PURPOSE_LABELS[purpose] || purpose}</td>
                <td className="py-2 pr-4">{stat.count}</td>
                <td className="py-2 pr-4 font-bold text-[#2563eb]">{formatVnd(stat.totalVnd)}</td>
              </tr>
            ))}
            {Object.keys(data.paymentByPurpose || {}).length === 0 && (
              <tr><td colSpan={3} className="py-4 text-center text-[#64748B]">Chưa có giao dịch nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-xs overflow-x-auto">
        <h3 className="text-sm font-bold text-[#172554]">Đối soát theo loại booking</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-[#64748B]">
              <th className="py-2 pr-4">Loại</th>
              <th className="py-2 pr-4">Số lượng</th>
              <th className="py-2 pr-4">Tổng gross</th>
              <th className="py-2 pr-4">Hoa hồng</th>
              <th className="py-2 pr-4">Trả đối tác</th>
            </tr>
          </thead>
          <tbody>
            {data.settlementByType.map((row) => (
              <tr key={row.booking_type} className="border-t border-[#eff6ff]">
                <td className="py-2 pr-4 font-semibold text-[#172554]">
                  {row.booking_type === 'expert' ? 'Tư vấn chuyên gia' : 'Dịch vụ quanh bạn'}
                </td>
                <td className="py-2 pr-4">{row.booking_count}</td>
                <td className="py-2 pr-4">{formatVnd(row.gross_total_vnd)}</td>
                <td className="py-2 pr-4">{formatVnd(row.commission_total_vnd)}</td>
                <td className="py-2 pr-4">{formatVnd(row.payout_total_vnd)}</td>
              </tr>
            ))}
            {data.settlementByType.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-[#64748B]">Chưa có dữ liệu đối soát.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Chi tiết 1 thành viên, thông tin định danh (SĐT, ngày sinh, địa chỉ, ngân hàng, MXH) mà bảng
// chính không đủ chỗ hiển thị, lịch sử giao dịch, và nút khoá/mở khoá tài khoản (nghi rửa tiền/gian
// lận...). bank_account_masked chỉ có 4 số cuối theo thiết kế (xem schema.sql), không phải lỗi hiển thị.
function MemberDetailRow({ member, onLockChanged }) {
  const [transactions, setTransactions] = useState(null)
  const [error, setError] = useState('')
  const [lockBusy, setLockBusy] = useState(false)
  const [lockError, setLockError] = useState('')

  useEffect(() => {
    adminApiClient.get(`/admin/members/${member.id}/transactions`).then(setTransactions).catch((err) => setError(err.message))
  }, [member.id])

  async function handleLock() {
    const reason = window.prompt('Lý do khoá tài khoản (hiện cho người dùng thấy khi họ đăng nhập):', '')
    if (reason === null) return
    setLockBusy(true)
    setLockError('')
    try {
      const result = await adminApiClient.post(`/admin/members/${member.id}/lock`, { reason })
      onLockChanged(member.id, result)
    } catch (err) {
      setLockError(err.message)
    } finally {
      setLockBusy(false)
    }
  }

  async function handleUnlock() {
    setLockBusy(true)
    setLockError('')
    try {
      const result = await adminApiClient.post(`/admin/members/${member.id}/unlock`)
      onLockChanged(member.id, result)
    } catch (err) {
      setLockError(err.message)
    } finally {
      setLockBusy(false)
    }
  }

  return (
    <tr className="border-t border-[#eff6ff] bg-[#eff6ff]/40">
      <td colSpan={12} className="py-3 px-4 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Thông tin thành viên</p>
          <div className="mt-2 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <p><span className="text-[#64748B]">Ngày sinh:</span> <span className="font-semibold text-[#172554]">{member.dateOfBirth ? formatDate(member.dateOfBirth) : 'Chưa có'}</span></p>
            <p><span className="text-[#64748B]">Địa chỉ:</span> <span className="font-semibold text-[#172554]">{member.addressVi || 'Chưa có'}</span></p>
            <p>
              <span className="text-[#64748B]">Mạng xã hội:</span>{' '}
              {member.socialLink ? (
                <a href={member.socialLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#2563eb] hover:underline">{member.socialLink}</a>
              ) : <span className="font-semibold text-[#172554]">Chưa có</span>}
            </p>
            <p><span className="text-[#64748B]">Ngân hàng liên kết:</span> <span className="font-semibold text-[#172554]">{member.bankName || 'Chưa có'}</span></p>
            <p><span className="text-[#64748B]">Số TK (4 số cuối):</span> <span className="font-mono font-semibold text-[#172554]">{member.bankAccountMasked || 'Chưa có'}</span></p>
            <p><span className="text-[#64748B]">Liên kết ngân hàng lúc:</span> <span className="font-semibold text-[#172554]">{member.bankLinkedAt ? formatDateTime(member.bankLinkedAt) : 'Chưa có'}</span></p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {member.isLocked ? (
              <>
                <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-bold text-rose-600">
                  Đã khoá{member.lockedReason ? `: ${member.lockedReason}` : ''}
                </span>
                <button
                  type="button"
                  disabled={lockBusy}
                  onClick={handleUnlock}
                  className="rounded-lg border border-[#dbeafe] px-3 py-1.5 text-[11px] font-bold text-[#2563eb] hover:border-[#2563eb] disabled:opacity-60"
                >
                  Mở khoá
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={lockBusy}
                onClick={handleLock}
                className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                <LockIcon className="h-3 w-3" />
                Khoá tài khoản
              </button>
            )}
            {lockError && <span className="text-[11px] font-medium text-rose-600">{lockError}</span>}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Lịch sử giao dịch của {member.email}</p>
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
          {!transactions && !error && <p className="mt-2 text-xs text-[#64748B]">Đang tải...</p>}
          {transactions && transactions.length === 0 && (
            <p className="mt-2 text-xs text-[#64748B]">Chưa có giao dịch nào.</p>
          )}
          {transactions && transactions.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {transactions.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white border border-[#dbeafe] px-3 py-2 text-xs">
                  <span className="font-semibold text-[#172554]">{TRANSACTION_PURPOSE_LABELS[t.purpose] || t.purpose}</span>
                  <span className="text-[#64748B]">{formatDateTime(t.completedAt || t.createdAt)}</span>
                  <span className="font-mono text-[#64748B]">{t.providerRef}</span>
                  <span className="font-bold text-[#2563eb]">{formatVnd(t.amountVnd)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

function MembersTab() {
  const [members, setMembers] = useState(null)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    adminApiClient.get('/admin/members').then(setMembers).catch((err) => setError(err.message))
  }, [])

  function handleLockChanged(memberId, result) {
    setMembers((prev) => prev.map((m) => (m.id === memberId
      ? { ...m, isLocked: result.isLocked, lockedReason: result.lockedReason, lockedAt: result.lockedAt }
      : m)))
  }

  if (error) return <p className="text-sm text-rose-600">{error}</p>
  if (!members) return <p className="text-sm text-[#64748B]">Đang tải...</p>

  return (
    <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-xs overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-[#64748B]">
            <th className="py-2 pr-4">Họ tên</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">SĐT</th>
            <th className="py-2 pr-4">Ngày tham gia</th>
            <th className="py-2 pr-4">Gói</th>
            <th className="py-2 pr-4">Số dư ví</th>
            <th className="py-2 pr-4">Điểm tích luỹ</th>
            <th className="py-2 pr-4">Lịch hẹn CG</th>
            <th className="py-2 pr-4">Đặt dịch vụ</th>
            <th className="py-2 pr-4">Đánh giá</th>
            <th className="py-2 pr-4">Trạng thái</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <Fragment key={m.id}>
              <tr className="border-t border-[#eff6ff]">
                <td className="py-2 pr-4 font-semibold text-[#172554]">{m.fullName || 'Chưa có'}</td>
                <td className="py-2 pr-4">{m.email}</td>
                <td className="py-2 pr-4">{m.phone || 'Chưa có'}</td>
                <td className="py-2 pr-4">{formatDate(m.createdAt)}</td>
                <td className="py-2 pr-4">{m.planId}</td>
                <td className="py-2 pr-4">{formatVnd(m.balanceVnd)}</td>
                <td className="py-2 pr-4">{m.loyaltyPoints}</td>
                <td className="py-2 pr-4">{m.expertBookingCount}</td>
                <td className="py-2 pr-4">{m.venueBookingCount}</td>
                <td className="py-2 pr-4">{m.reviewCount}</td>
                <td className="py-2 pr-4">
                  {m.isLocked ? (
                    <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">Đã khoá</span>
                  ) : (
                    <span className="rounded-full bg-[#6F9D8D]/15 border border-[#6F9D8D]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#2563eb]">Hoạt động</span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                    className="flex items-center gap-1 rounded-lg border border-[#dbeafe] px-2.5 py-1 text-[11px] font-bold text-[#2563eb] hover:border-[#2563eb]"
                  >
                    <HistoryIcon className="h-3 w-3" />
                    {expandedId === m.id ? 'Ẩn' : 'Chi tiết'}
                  </button>
                </td>
              </tr>
              {expandedId === m.id && <MemberDetailRow member={m} onLockChanged={handleLockChanged} />}
            </Fragment>
          ))}
          {members.length === 0 && (
            <tr><td colSpan={12} className="py-4 text-center text-[#64748B]">Chưa có thành viên nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const inputCls = 'w-full rounded-xl border border-[#dbeafe] bg-white px-3.5 py-2.5 text-sm text-[#172554] focus:border-[#2563eb] focus:outline-none'

function ExpertForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    specialty: initial?.specialty || '',
    clinicName: initial?.clinicName || '',
    areaVi: initial?.areaVi || '',
    bioVi: initial?.bioVi || '',
    consultationFeeVnd: initial?.consultationFeeVnd || 0,
    availableSlotsText: (initial?.availableSlots || []).join(', '),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      name: form.name, specialty: form.specialty, clinicName: form.clinicName,
      areaVi: form.areaVi, bioVi: form.bioVi,
      consultationFeeVnd: Number(form.consultationFeeVnd) || 0,
      availableSlots: form.availableSlotsText.split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (initial?.id) {
        await adminApiClient.put(`/admin/experts/${initial.id}`, payload)
      } else {
        await adminApiClient.post('/admin/experts', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2563eb]/30 bg-[#eff6ff] p-5 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder="Tên chuyên gia" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputCls} />
        <input required placeholder="Chuyên khoa" value={form.specialty} onChange={(e) => update('specialty', e.target.value)} className={inputCls} />
        <input required placeholder="Tên phòng khám" value={form.clinicName} onChange={(e) => update('clinicName', e.target.value)} className={inputCls} />
        <input required placeholder="Khu vực" value={form.areaVi} onChange={(e) => update('areaVi', e.target.value)} className={inputCls} />
      </div>
      <textarea required rows={2} placeholder="Giới thiệu" value={form.bioVi} onChange={(e) => update('bioVi', e.target.value)} className={inputCls} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input type="number" min="0" placeholder="Phí tư vấn (VNĐ)" value={form.consultationFeeVnd} onChange={(e) => update('consultationFeeVnd', e.target.value)} className={inputCls} />
        <input placeholder="Khung giờ trống, cách nhau bởi dấu phẩy" value={form.availableSlotsText} onChange={(e) => update('availableSlotsText', e.target.value)} className={inputCls} />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#172554] disabled:opacity-60">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-[#dbeafe] px-4 py-2 text-xs font-bold text-[#64748B]">
          Huỷ
        </button>
      </div>
    </form>
  )
}

function ExpertCertifications({ expert, onChanged }) {
  const [saving, setSaving] = useState(false)

  async function toggleVerified(index) {
    const next = expert.certifications.map((c, i) => (i === index ? { ...c, verified: !c.verified } : c))
    setSaving(true)
    try {
      await adminApiClient.put(`/admin/experts/${expert.id}/certifications`, { certifications: next })
      onChanged()
    } finally {
      setSaving(false)
    }
  }

  if (expert.certifications.length === 0) {
    return <p className="text-xs text-[#64748B]">Chưa có chứng chỉ nào.</p>
  }

  return (
    <div className={`space-y-1.5 ${saving ? 'opacity-60' : ''}`}>
      {expert.certifications.map((c, i) => (
        <label key={i} className="flex items-center gap-2.5 rounded-lg bg-white border border-[#dbeafe] px-3 py-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(c.verified)}
            onChange={() => toggleVerified(i)}
            className="h-3.5 w-3.5 accent-[#2563eb]"
          />
          <span className="font-semibold text-[#172554]">{c.title_vi}</span>
          {c.license_no && <span className="font-mono text-[#64748B]">· {c.license_no}</span>}
          {c.issuing_authority_vi && <span className="text-[#64748B]">· {c.issuing_authority_vi}</span>}
        </label>
      ))}
    </div>
  )
}

function ExpertsTab() {
  const [experts, setExperts] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  function load() {
    adminApiClient.get('/admin/experts').then(setExperts).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  if (error) return <p className="text-sm text-rose-600">{error}</p>
  if (!experts) return <p className="text-sm text-[#64748B]">Đang tải...</p>

  return (
    <div className="space-y-4">
      {actionError && (
        <p className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600">
          {actionError}
        </p>
      )}

      <div className="flex justify-end">
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#172554]"
          >
            + Thêm chuyên gia
          </button>
        )}
      </div>

      {creating && (
        <ExpertForm
          onCancel={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            load()
          }}
        />
      )}

      <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-[#64748B]">
              <th className="py-2 pr-4">Chuyên gia</th>
              <th className="py-2 pr-4">Chuyên khoa</th>
              <th className="py-2 pr-4">Khu vực</th>
              <th className="py-2 pr-4">Đánh giá TB</th>
              <th className="py-2 pr-4">Lịch hẹn</th>
              <th className="py-2 pr-4">Phí tư vấn</th>
              <th className="py-2 pr-4">Chứng chỉ</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {experts.map((e) => (
              <Fragment key={e.id}>
                <tr className="border-t border-[#eff6ff]">
                  <td className="py-2 pr-4 font-semibold text-[#172554]">{e.name}</td>
                  <td className="py-2 pr-4">{e.specialty}</td>
                  <td className="py-2 pr-4">{e.areaVi}</td>
                  <td className="py-2 pr-4">{Number(e.ratingAvg).toFixed(1)} ({e.reviewCount})</td>
                  <td className="py-2 pr-4">{e.bookingCount}</td>
                  <td className="py-2 pr-4">{formatVnd(e.consultationFeeVnd)}</td>
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        e.unverifiedCertificationCount > 0
                          ? 'bg-[#D8B27A]/15 border border-[#D8B27A]/30 text-[#A87A45]'
                          : 'bg-[#6F9D8D]/15 border border-[#6F9D8D]/30 text-[#2563eb]'
                      }`}
                    >
                      {e.certificationCount - e.unverifiedCertificationCount}/{e.certificationCount} đã xác thực
                    </button>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingId(editingId === e.id ? null : e.id)}
                        className="rounded-lg border border-[#dbeafe] px-2.5 py-1 text-[11px] font-bold text-[#2563eb] hover:border-[#2563eb]"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Xoá chuyên gia ${e.name}?`)) return
                          setActionError('')
                          try {
                            await adminApiClient.delete(`/admin/experts/${e.id}`)
                            load()
                          } catch (err) {
                            setActionError(err.message)
                          }
                        }}
                        aria-label={`Xoá chuyên gia ${e.name}`}
                        className="flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
                {editingId === e.id && (
                  <tr className="border-t border-[#eff6ff]">
                    <td colSpan={8} className="py-3 px-4">
                      <ExpertForm
                        initial={e}
                        onCancel={() => setEditingId(null)}
                        onSaved={() => {
                          setEditingId(null)
                          load()
                        }}
                      />
                    </td>
                  </tr>
                )}
                {expandedId === e.id && (
                  <tr className="border-t border-[#eff6ff] bg-[#eff6ff]/40">
                    <td colSpan={8} className="py-3 px-4">
                      <ExpertCertifications expert={e} onChanged={load} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function VenueApplicationsTab() {
  const [applications, setApplications] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    adminApiClient.get('/admin/venue-applications').then(setApplications).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function handleReview(id, decision) {
    setBusyId(id)
    try {
      await adminApiClient.post(`/admin/venue-applications/${id}/review`, { decision })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (error) return <p className="text-sm text-rose-600">{error}</p>
  if (!applications) return <p className="text-sm text-[#64748B]">Đang tải...</p>

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div key={app.id} className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[#172554]">{app.businessName} <span className="font-normal text-[#64748B]">· {app.category}</span></p>
              <p className="mt-1 text-xs text-[#64748B]">{app.addressVi}, {app.areaVi}</p>
              <p className="mt-1 text-xs text-[#64748B]">Liên hệ: {app.contactName} · {app.contactPhone} · {app.contactEmail}</p>
              <p className="mt-2 text-sm text-[#172554]/80">{app.descriptionVi}</p>
              <p className="mt-2 text-[11px] text-[#64748B]">Nộp ngày {formatDate(app.submittedAt)}</p>
              {app.adminNote && (
                <p className="mt-1 text-[11px] italic text-[#64748B]">Ghi chú: {app.adminNote}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {app.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    disabled={busyId === app.id}
                    onClick={() => handleReview(app.id, 'approved')}
                    className="flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#172554] disabled:opacity-60"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" /> Duyệt
                  </button>
                  <button
                    type="button"
                    disabled={busyId === app.id}
                    onClick={() => handleReview(app.id, 'rejected')}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <XCircleIcon className="h-3.5 w-3.5" /> Từ chối
                  </button>
                </>
              ) : (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  app.status === 'approved'
                    ? 'bg-[#6F9D8D]/15 border border-[#6F9D8D]/30 text-[#2563eb]'
                    : 'bg-rose-50 border border-rose-200 text-rose-600'
                }`}>
                  {app.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      {applications.length === 0 && (
        <p className="text-sm text-[#64748B]">Chưa có đơn đăng ký đối tác nào.</p>
      )}
    </div>
  )
}

function ExpertApplicationsTab() {
  const [applications, setApplications] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    adminApiClient.get('/admin/expert-applications').then(setApplications).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function handleReview(id, decision) {
    setBusyId(id)
    try {
      await adminApiClient.post(`/admin/expert-applications/${id}/review`, { decision })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (error) return <p className="text-sm text-rose-600">{error}</p>
  if (!applications) return <p className="text-sm text-[#64748B]">Đang tải...</p>

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div key={app.id} className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[#172554]">{app.fullName} <span className="font-normal text-[#64748B]">· {app.specialty}</span></p>
              <p className="mt-1 text-xs text-[#64748B]">{app.clinicName}, {app.areaVi}</p>
              <p className="mt-1 text-xs text-[#64748B]">Liên hệ: {app.contactPhone} · {app.contactEmail}</p>
              <p className="mt-2 text-sm text-[#172554]/80">{app.bioVi}</p>
              <p className="mt-2 text-xs font-semibold text-[#2563eb]">
                Đề xuất: {formatVnd(app.proposedFeeVnd)} / buổi · {app.proposedSlots.join(', ')}
              </p>
              <p className="mt-2 text-[11px] text-[#64748B]">Nộp ngày {formatDate(app.submittedAt)}</p>
              {app.adminNote && (
                <p className="mt-1 text-[11px] italic text-[#64748B]">Ghi chú: {app.adminNote}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {app.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    disabled={busyId === app.id}
                    onClick={() => handleReview(app.id, 'approved')}
                    className="flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#172554] disabled:opacity-60"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" /> Duyệt
                  </button>
                  <button
                    type="button"
                    disabled={busyId === app.id}
                    onClick={() => handleReview(app.id, 'rejected')}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <XCircleIcon className="h-3.5 w-3.5" /> Từ chối
                  </button>
                </>
              ) : (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  app.status === 'approved'
                    ? 'bg-[#6F9D8D]/15 border border-[#6F9D8D]/30 text-[#2563eb]'
                    : 'bg-rose-50 border border-rose-200 text-rose-600'
                }`}>
                  {app.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      {applications.length === 0 && (
        <p className="text-sm text-[#64748B]">Chưa có đơn ứng tuyển chuyên gia nào.</p>
      )}
    </div>
  )
}

function SponsoredPlacementsTab() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  function load() {
    adminApiClient.get('/admin/sponsored-placements').then(setProducts).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function togglePlacement(product, key) {
    const nextPlacements = product.placements.includes(key)
      ? product.placements.filter((p) => p !== key)
      : [...product.placements, key]

    setSavingId(product.id)
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, placements: nextPlacements } : p)))
    try {
      await adminApiClient.put(`/admin/sponsored-placements/${product.id}`, { placements: nextPlacements })
    } catch (err) {
      setError(err.message)
      load()
    } finally {
      setSavingId(null)
    }
  }

  if (error) return <p className="text-sm text-rose-600">{error}</p>
  if (!products) return <p className="text-sm text-[#64748B]">Đang tải...</p>

  return (
    <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-xs overflow-x-auto">
      <p className="text-xs text-[#64748B] mb-4">Bật/tắt vị trí sản phẩm tài trợ được phép xuất hiện. Thay đổi có hiệu lực ngay trên web.</p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-[#64748B]">
            <th className="py-2 pr-4">Sản phẩm</th>
            <th className="py-2 pr-4">Nhà tài trợ</th>
            {PLACEMENT_OPTIONS.map((opt) => (
              <th key={opt.key} className="py-2 pr-4">{opt.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={`border-t border-[#eff6ff] ${savingId === p.id ? 'opacity-60' : ''}`}>
              <td className="py-2 pr-4 font-semibold text-[#172554]">{p.name}</td>
              <td className="py-2 pr-4">{p.sponsorName}</td>
              {PLACEMENT_OPTIONS.map((opt) => (
                <td key={opt.key} className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={p.placements.includes(opt.key)}
                    onChange={() => togglePlacement(p, opt.key)}
                    className="h-4 w-4 accent-[#2563eb] cursor-pointer"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Nhật ký hoạt động trang web, chỉ thao tác quan trọng (nạp tiền, mua gói, đặt lịch/dịch vụ, đăng
// bài, mở tư vấn chuyên gia...), KHÔNG log việc chuyển tab. Lọc theo loại + tìm theo tên/email, phân
// trang kiểu "Tải thêm" (offset cộng dồn) thay vì số trang cho đơn giản.
const ACTIVITY_PAGE_SIZE = 30

function ActivityTab() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function load(offset, replace) {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ limit: String(ACTIVITY_PAGE_SIZE), offset: String(offset) })
    if (type) params.set('type', type)
    if (q.trim()) params.set('q', q.trim())
    adminApiClient
      .get(`/admin/activity?${params.toString()}`)
      .then((data) => {
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]))
        setTotal(data.total)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(0, true) }, [type])

  function handleSearchSubmit(e) {
    e.preventDefault()
    load(0, true)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-[#dbeafe] bg-white px-3 py-2 text-xs font-semibold text-[#172554] focus:border-[#2563eb] focus:outline-none"
        >
          <option value="">Tất cả loại hoạt động</option>
          {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="min-w-[220px] flex-1 rounded-xl border border-[#dbeafe] bg-white px-3.5 py-2 text-xs text-[#172554] focus:border-[#2563eb] focus:outline-none"
        />
        <button type="submit" className="rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#172554]">
          Tìm
        </button>
      </form>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="rounded-2xl border border-[#dbeafe] bg-white p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-[#64748B]">
              <th className="py-2 pr-4">Thời gian</th>
              <th className="py-2 pr-4">Thành viên</th>
              <th className="py-2 pr-4">Loại</th>
              <th className="py-2 pr-4">Nội dung</th>
              <th className="py-2 pr-4">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-[#eff6ff]">
                <td className="py-2 pr-4 whitespace-nowrap text-xs text-[#64748B]">{formatDateTime(it.createdAt)}</td>
                <td className="py-2 pr-4">
                  <p className="font-semibold text-[#172554]">{it.userName}</p>
                  <p className="text-[11px] text-[#64748B]">{it.userEmail}</p>
                </td>
                <td className="py-2 pr-4">
                  <span className="rounded-full bg-[#6F9D8D]/15 border border-[#6F9D8D]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#2563eb]">
                    {ACTIVITY_TYPE_LABELS[it.type] || it.type}
                  </span>
                </td>
                <td className="py-2 pr-4 text-[#172554]">{it.description}</td>
                <td className="py-2 pr-4 font-bold text-[#2563eb]">{it.amountVnd != null ? formatVnd(it.amountVnd) : 'Không có'}</td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan={5} className="py-4 text-center text-[#64748B]">Không có hoạt động nào khớp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>

        {loading && <p className="mt-3 text-center text-xs text-[#64748B]">Đang tải...</p>}

        {!loading && items.length < total && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => load(items.length, false)}
              className="rounded-xl border border-[#dbeafe] px-4 py-2 text-xs font-bold text-[#2563eb] hover:border-[#2563eb]"
            >
              Tải thêm ({items.length}/{total})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const TABS = [
  { key: 'overview', label: 'Tổng quan', icon: WalletIcon, Component: OverviewTab },
  { key: 'members', label: 'Thành viên', icon: UserIcon, Component: MembersTab },
  { key: 'activity', label: 'Lịch sử', icon: HistoryIcon, Component: ActivityTab },
  { key: 'experts', label: 'Chuyên gia', icon: StethoscopeIcon, Component: ExpertsTab },
  { key: 'venues', label: 'Đăng ký đối tác', icon: MapIcon, Component: VenueApplicationsTab },
  { key: 'expert-applications', label: 'Ứng tuyển chuyên gia', icon: StethoscopeIcon, Component: ExpertApplicationsTab },
  { key: 'placements', label: 'Vị trí sản phẩm', icon: SparklesIcon, Component: SponsoredPlacementsTab },
]

function AdminDashboardPage() {
  useDocumentTitle('Cổng Quản Trị')
  const [admin, setAdmin] = useState(null)
  const [loggedIn, setLoggedIn] = useState(Boolean(getAdminToken()))
  const [activeTab, setActiveTab] = useState('overview')

  function handleLogout() {
    setAdminToken(null)
    setLoggedIn(false)
  }

  useEffect(() => onAuthExpired(ADMIN_TOKEN_KEY, handleLogout), [])

  if (!loggedIn) {
    return (
      <AdminLoginForm
        onLoggedIn={(a) => {
          setAdmin(a)
          setLoggedIn(true)
        }}
      />
    )
  }

  const ActiveComponent = TABS.find((t) => t.key === activeTab)?.Component

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fbff] via-white to-blue-50 px-4 py-10">
      <div className="mx-auto max-w-[1200px]">
      <div className="relative overflow-hidden rounded-3xl bg-[#172554] p-6 text-white shadow-[0_20px_55px_rgba(23,37,84,.2)] sm:p-8">
        <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-blue-500/30 blur-2xl" />
        <div className="absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-orange-500/25 blur-xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Healthy Skin Operations</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Cổng Quản Trị</h1>
          <p className="mt-1 text-sm text-blue-100/70">{admin?.name || 'Quản trị viên'}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 hover:border-rose-400"
        >
          <LogOutIcon className="h-3.5 w-3.5" />
          Đăng xuất
        </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === tab.key
                ? 'bg-[#2563eb] text-white'
                : 'bg-white border border-[#dbeafe] text-[#64748B] hover:border-[#2563eb]/50'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
