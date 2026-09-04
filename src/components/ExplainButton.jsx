import { useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { useProfile } from '../context/ProfileContext'
import { SparklesIcon } from './Icons'

function ExplainButton({ nameVi, category, result, reason }) {
  const { profile } = useProfile()
  const [status, setStatus] = useState('idle')
  const [explanation, setExplanation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleClick() {
    if (status === 'loading') return
    setStatus('loading')
    setErrorMessage('')
    try {
      const data = await apiClient.post('/explain', { nameVi, category, result, reason, profile })
      setExplanation(data.explanation)
      setStatus('done')
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-2.5 rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-3.5 text-sm leading-relaxed whitespace-pre-line text-[#172554]">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#1d4ed8]">
          <SparklesIcon className="h-3.5 w-3.5 text-[#2563eb]" />
          Giải thích thêm từ AI
        </p>
        {explanation}
      </div>
    )
  }

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading'}
        className="flex items-center gap-1.5 rounded-xl border border-[#dbeafe] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1d4ed8] transition hover:bg-[#2563eb] hover:text-white disabled:opacity-60"
      >
        <SparklesIcon className="h-3.5 w-3.5" />
        {status === 'loading' ? 'Đang tạo giải thích...' : 'Giải thích thêm bằng AI'}
      </button>
      {status === 'error' && <p className="mt-1.5 text-xs text-rose-500">{errorMessage}</p>}
    </div>
  )
}

export default ExplainButton
