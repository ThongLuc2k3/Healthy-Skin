import { useEffect, useState } from 'react'
import { apiClient, openAuthedFile } from '../lib/apiClient'
import { ShieldIcon, CameraIcon, TrashIcon, DocumentIcon } from './Icons'
import AuthedImage from './AuthedImage'

const DISCLAIMER =
  'Thông tin trong mục này chỉ mang tính tham khảo để cá nhân hoá gợi ý. KHÔNG phải chẩn đoán y khoa và không thay thế tư vấn của bác sĩ.'

function emptyConditionRow() {
  return { name_vi: '', diagnosed_date: '', note: '' }
}

function ConsentGate({ onConsent, submitting }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="rounded-3xl border border-[#D8B27A]/30 bg-gradient-to-br from-[#D8B27A]/10 via-[#FDFDFB] to-[#BFD8CF]/20 p-7 shadow-[0_6px_24px_rgba(216,178,122,0.08)]">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D8B27A]/20 text-[#A87A45] border border-[#D8B27A]/40 shadow-xs">
          <ShieldIcon className="h-5 w-5" />
        </span>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-[#172554]">Trước khi tiếp tục: dữ liệu nhạy cảm</h3>
          <p className="text-sm leading-relaxed text-[#5F7480]">
            Mục này cho phép bạn lưu ảnh khuôn mặt, bệnh lý da liễu đã được chẩn đoán, và file kết quả
            khám để cá nhân hoá gợi ý tốt hơn. Đây là dữ liệu sinh trắc học/sức khoẻ:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#5F7480]">
            <li>Chỉ dùng để cá nhân hoá gợi ý trên tài khoản của bạn, không chia sẻ cho bên thứ ba.</li>
            <li>Bạn có thể xoá vĩnh viễn ảnh/bệnh lý/báo cáo bất kỳ lúc nào.</li>
            <li>{DISCLAIMER}</li>
          </ul>
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-semibold text-[#172554]">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4.5 w-4.5 rounded-md border-[#BFD8CF] bg-white text-[#2563eb] focus:ring-[#2563eb]"
            />
            Tôi đã đọc và đồng ý lưu các thông tin trên.
          </label>
          <button
            type="button"
            disabled={!checked || submitting}
            onClick={onConsent}
            className="mt-4 rounded-full bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#6F9D8D] px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(47, 169, 140,0.25)] transition-all hover:shadow-[0_8px_24px_rgba(112, 196, 175,0.35)] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Tôi đồng ý, tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FacePhotoBlock({ facePhotoUrl, onUpload, onDelete, busy }) {
  return (
    <div className="rounded-3xl border border-[#E9EEF1] bg-[#FDFDFB] p-6 shadow-[0_6px_20px_rgba(14, 59, 51,0.03)]">
      <p className="text-xs font-bold tracking-wider text-[#2563eb] uppercase">Ảnh khuôn mặt (tuỳ chọn)</p>
      <div className="mt-4 flex items-center gap-5">
        {facePhotoUrl ? (
          <AuthedImage src={facePhotoUrl} alt="Ảnh khuôn mặt" className="h-20 w-20 rounded-2xl object-cover border border-[#2563eb]/30 shadow-xs" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F5FAFC] text-[#5F7480] border border-[#E9EEF1]">
            <CameraIcon className="h-6 w-6" />
          </span>
        )}
        <div className="flex flex-col gap-2.5">
          <label className="cursor-pointer rounded-full border border-[#2563eb]/40 bg-[#F5FAFC] px-5 py-2 text-sm font-bold text-[#2563eb] shadow-xs transition-all hover:bg-[#60a5fa]/10 hover:border-[#2563eb]">
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
            {facePhotoUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
          </label>
          {facePhotoUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="flex items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 disabled:opacity-50"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Xoá ảnh
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DiagnosedConditionsBlock({ conditions, suggestedConditions, onSave, saving }) {
  const [rows, setRows] = useState(conditions.length > 0 ? conditions : [])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setRows(conditions)
    setDirty(false)
  }, [conditions])

  // AI vừa đọc xong 1 file báo cáo mới tải lên, điền sẵn bệnh lý đọc được vào form, đánh dấu dirty
  // để nút "Lưu bệnh lý" hiện ra, người dùng tự xem lại/sửa rồi mới bấm lưu (không tự lưu thay).
  useEffect(() => {
    if (suggestedConditions && suggestedConditions.length > 0) {
      setRows((prev) => [...prev, ...suggestedConditions])
      setDirty(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedConditions])

  function updateRow(index, field, value) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
    setDirty(true)
  }

  function addRow() {
    setRows((prev) => [...prev, emptyConditionRow()])
    setDirty(true)
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index))
    setDirty(true)
  }

  return (
    <div className="rounded-3xl border border-[#E9EEF1] bg-[#FDFDFB] p-6 shadow-[0_6px_20px_rgba(14, 59, 51,0.03)]">
      <p className="text-xs font-bold tracking-wider text-[#2563eb] uppercase">
        Bệnh lý da liễu đã được chẩn đoán (tuỳ chọn)
      </p>
      <p className="mt-1 text-xs text-[#5F7480]">
        Tự nhập tay, hoặc tải file báo cáo khám ở mục bên dưới để AI đọc và điền sẵn. Bạn kiểm tra lại rồi bấm "Lưu bệnh lý" để xác nhận.
      </p>

      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 rounded-2xl bg-[#F5FAFC] border border-[#E9EEF1] p-3.5 sm:grid-cols-[1fr_130px_1fr_auto]">
            <input
              type="text"
              placeholder="Tên bệnh (vd: Viêm da cơ địa)"
              value={row.name_vi}
              onChange={(e) => updateRow(index, 'name_vi', e.target.value)}
              className="rounded-xl bg-white border border-[#E9EEF1] px-3.5 py-2 text-sm text-[#172554] placeholder-[#5F7480]/60 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
            />
            <input
              type="text"
              placeholder="2025-03"
              value={row.diagnosed_date}
              onChange={(e) => updateRow(index, 'diagnosed_date', e.target.value)}
              className="rounded-xl bg-white border border-[#E9EEF1] px-3.5 py-2 text-sm text-[#172554] placeholder-[#5F7480]/60 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Ghi chú (vd: BS BV Da liễu chẩn đoán)"
              value={row.note}
              onChange={(e) => updateRow(index, 'note', e.target.value)}
              className="rounded-xl bg-white border border-[#E9EEF1] px-3.5 py-2 text-sm text-[#172554] placeholder-[#5F7480]/60 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="flex items-center justify-center rounded-xl px-2 text-rose-500 hover:bg-rose-50"
              aria-label="Xoá dòng"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-dashed border-[#2563eb]/40 bg-[#F5FAFC] px-4 py-2 text-sm font-bold text-[#2563eb] hover:border-[#2563eb] hover:bg-[#60a5fa]/10"
        >
          + Thêm bệnh lý
        </button>
        {dirty && (
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave(rows)}
            className="rounded-full bg-[#2563eb] px-5 py-2 text-sm font-bold text-white shadow-xs disabled:opacity-60 hover:bg-[#172554]"
          >
            {saving ? 'Đang lưu...' : 'Lưu bệnh lý'}
          </button>
        )}
      </div>
    </div>
  )
}

function ExpertReportsBlock({ reports, onUpload, onDelete, busy }) {
  return (
    <div className="rounded-3xl border border-[#E9EEF1] bg-[#FDFDFB] p-6 shadow-[0_6px_20px_rgba(14, 59, 51,0.03)]">
      <p className="text-xs font-bold tracking-wider text-[#2563eb] uppercase">
        Báo cáo/kết quả khám (tuỳ chọn)
      </p>

      <ul className="mt-4 space-y-2.5">
        {reports.map((report) => (
          <li
            key={report.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#F5FAFC] border border-[#E9EEF1] px-4 py-3"
          >
            <button
              type="button"
              onClick={() => openAuthedFile(report.fileUrl)}
              className="flex items-center gap-2.5 text-sm font-bold text-[#172554] hover:text-[#2563eb]"
            >
              <DocumentIcon className="h-4.5 w-4.5 text-[#2563eb]" />
              {report.originalName || `Báo cáo #${report.id}`}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(report.id)}
              className="text-rose-500 hover:text-rose-600 disabled:opacity-50"
              aria-label="Xoá báo cáo"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
        {reports.length === 0 && <li className="text-sm text-[#5F7480]">Chưa có báo cáo nào.</li>}
      </ul>

      <label className="mt-5 inline-block cursor-pointer rounded-full border border-[#2563eb]/40 bg-[#F5FAFC] px-5 py-2 text-sm font-bold text-[#2563eb] shadow-xs transition-all hover:bg-[#60a5fa]/10 hover:border-[#2563eb]">
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        Tải lên báo cáo (ảnh hoặc PDF)
      </label>
    </div>
  )
}

function ExtendedProfileSection() {
  const [status, setStatus] = useState('loading')
  const [profileData, setProfileData] = useState(null)
  const [reports, setReports] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState(null)

  useEffect(() => {
    Promise.all([apiClient.get('/profile', { auth: true }), apiClient.get('/profile/expert-reports', { auth: true })])
      .then(([profile, reportsList]) => {
        setProfileData(profile)
        setReports(reportsList)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [])

  async function handleConsent() {
    setBusy(true)
    setErrorMessage('')
    try {
      const updated = await apiClient.post('/profile/consent', {}, { auth: true })
      setProfileData(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleFaceUpload(file) {
    setBusy(true)
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('facePhoto', file)
      const updated = await apiClient.post('/profile/face-photo', formData, { auth: true, isFormData: true })
      setProfileData(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleFaceDelete() {
    setBusy(true)
    setErrorMessage('')
    try {
      const updated = await apiClient.delete('/profile/face-photo', { auth: true })
      setProfileData(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveConditions(rows) {
    setBusy(true)
    setErrorMessage('')
    try {
      const cleaned = rows.filter((r) => r.name_vi.trim().length > 0)
      const updated = await apiClient.put(
        '/profile/diagnosed-conditions',
        { diagnosedConditions: cleaned },
        { auth: true },
      )
      setProfileData(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleReportUpload(file) {
    setBusy(true)
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('report', file)
      const { suggestedConditions, ...report } = await apiClient.post(
        '/profile/expert-report', formData, { auth: true, isFormData: true },
      )
      setReports((prev) => [report, ...prev])
      if (suggestedConditions?.length > 0) setAiSuggestions(suggestedConditions)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleReportDelete(id) {
    setBusy(true)
    setErrorMessage('')
    try {
      await apiClient.delete(`/profile/expert-report/${id}`, { auth: true })
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') {
    return <p className="text-center text-sm font-semibold text-[#2563eb]">Đang tải hồ sơ mở rộng...</p>
  }
  if (status === 'error') {
    return <p className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700">{errorMessage}</p>
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-[#172554]">Hồ sơ mở rộng (tuỳ chọn)</h2>
        <p className="mt-1.5 text-sm text-[#5F7480] leading-relaxed">{DISCLAIMER}</p>
      </div>

      <div className="mt-6 space-y-5">
        {!profileData.consentGivenAt ? (
          <ConsentGate onConsent={handleConsent} submitting={busy} />
        ) : (
          <>
            <FacePhotoBlock
              facePhotoUrl={profileData.facePhotoUrl}
              onUpload={handleFaceUpload}
              onDelete={handleFaceDelete}
              busy={busy}
            />
            <ExpertReportsBlock
              reports={reports}
              onUpload={handleReportUpload}
              onDelete={handleReportDelete}
              busy={busy}
            />
            {aiSuggestions?.length > 0 && (
              <p className="rounded-2xl bg-[#2563eb]/10 border border-[#2563eb]/30 px-5 py-3 text-sm font-medium text-[#172554]">
                Đã điền sẵn {aiSuggestions.length} bệnh lý đọc được từ file. Sửa trực tiếp bên dưới nếu cần, rồi bấm "Lưu bệnh lý".
              </p>
            )}
            <DiagnosedConditionsBlock
              conditions={profileData.diagnosedConditions}
              suggestedConditions={aiSuggestions}
              onSave={(rows) => {
                setAiSuggestions(null)
                return handleSaveConditions(rows)
              }}
              saving={busy}
            />
          </>
        )}

        {errorMessage && (
          <p className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700">{errorMessage}</p>
        )}
      </div>
    </section>
  )
}

export default ExtendedProfileSection
