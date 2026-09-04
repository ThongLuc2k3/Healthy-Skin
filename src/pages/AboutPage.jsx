import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import aboutContent from '../data/aboutContent'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { LeafIcon, SparklesIcon, TrashIcon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const DELETE_CONFIRM_TEXT = 'XOÁ TÀI KHOẢN'

function DeleteAccountSection() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await apiClient.delete('/auth/me', { auth: true })
      logout()
      navigate('/')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <section className="motion-rise mt-6 rounded-[2rem] border border-rose-200 bg-rose-50/60 p-6 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-rose-900">
        <TrashIcon className="h-5 w-5" />
        Xoá tài khoản và dữ liệu
      </h2>
      <p className="mt-2 text-sm leading-6 text-rose-800/80">
        Xoá vĩnh viễn tài khoản cùng toàn bộ dữ liệu liên quan: hồ sơ cá nhân, ảnh khuôn mặt, bệnh lý
        đã khai báo, lịch sử quét, lịch hẹn chuyên gia và tin nhắn tư vấn, đánh giá trên diễn đàn. Hành
        động này không thể hoàn tác.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          Tôi muốn xoá tài khoản
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-rose-800/80">
            Gõ chính xác <span className="font-mono font-bold">{DELETE_CONFIRM_TEXT}</span> để xác nhận.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm text-rose-900 focus:border-rose-500 focus:outline-none"
            placeholder={DELETE_CONFIRM_TEXT}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={confirmText !== DELETE_CONFIRM_TEXT || deleting}
              onClick={handleDelete}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? 'Đang xoá...' : 'Xác nhận xoá vĩnh viễn'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setConfirmText('')
                setError('')
              }}
              className="text-sm font-semibold text-rose-700/70 hover:text-rose-900"
            >
              Huỷ
            </button>
          </div>
          {error && <p className="text-sm font-medium text-rose-700">{error}</p>}
        </div>
      )}
    </section>
  )
}

function AboutPage() {
  useDocumentTitle('Về chúng tôi')
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pt-28">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
          <SparklesIcon className="h-3.5 w-3.5" />
          Về chúng tôi
        </span>
        <h1 className="mt-4 flex items-center justify-center gap-2 text-3xl font-black tracking-tight text-slate-900">
          <LeafIcon className="h-7 w-7 text-emerald-600" />
          Healthy Skin
        </h1>
      </div>

      <section className="motion-rise surface-tint-strong mt-8 rounded-[2rem] border border-white/80 p-6 shadow-sm sm:p-8">
        {aboutContent.intro.map((block, index) => (
          <p key={index} className="mt-3 text-sm leading-7 text-slate-600 first:mt-0">
            {block.text}
          </p>
        ))}
      </section>

      <section className="motion-rise mt-6 rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-sm sm:p-8">
        {aboutContent.contact.map((block, index) =>
          block.type === 'article' ? (
            <h2 key={index} className="text-lg font-bold tracking-tight text-slate-900">
              {block.text}
            </h2>
          ) : (
            <p key={index} className="mt-2 text-sm leading-6 text-slate-600">
              {block.text}
            </p>
          ),
        )}
      </section>

      <DeleteAccountSection />
    </div>
  )
}

export default AboutPage
