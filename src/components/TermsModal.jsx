import { useEffect } from 'react'
import termsFull from '../data/termsFull'
import { CloseIcon, DocumentIcon } from './Icons'

function TermsBlock({ block, index }) {
  if (block.type === 'chapter') {
    return (
      <h3 key={index} className="mt-6 text-base font-bold tracking-tight text-slate-900 first:mt-0">
        {block.text}
      </h3>
    )
  }
  if (block.type === 'article') {
    return (
      <h4 key={index} className="mt-4 text-sm font-semibold text-emerald-700">
        {block.text}
      </h4>
    )
  }
  if (block.type === 'list') {
    return (
      <ul key={index} className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )
  }
  return (
    <p key={index} className="mt-2 text-sm leading-6 text-slate-600">
      {block.text}
    </p>
  )
}

function TermsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <DocumentIcon className="h-4 w-4" />
            Quy chế hoạt động và Điều khoản sử dụng
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng điều khoản sử dụng"
            className="rounded-lg p-1 transition hover:bg-white/20"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {termsFull.map((block, index) => (
            <TermsBlock key={index} block={block} index={index} />
          ))}
        </div>

        <div className="border-t border-slate-100 p-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsModal
