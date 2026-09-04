import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AI_REQUEST_TIMEOUT_MS, apiClient, onChatWalletUpdated } from '../lib/apiClient'
import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { ChatBubbleIcon, CloseIcon, SendIcon, SparklesIcon } from './Icons'

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: 'Xin chào! Mình là Agent HEALTHY SKIN. Bạn có thể nhờ mình tra cứu, quản lý hồ sơ, tìm và đặt lịch chuyên gia, đặt dịch vụ, xem ví, voucher hoặc lịch sử ngay trong chat nhé.',
}

const CHAT_MEMORY_MESSAGES = 20 // 10 lượt hỏi và trả lời gần nhất.

function chatStorageKey(user) {
  return `healthy_skin_chat_history_${user?.id || user?.email || 'guest'}`
}

function readChatHistory(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(stored) || stored.length === 0) return [WELCOME_MESSAGE]
    return [WELCOME_MESSAGE, ...stored.filter((message) => message?.role && message?.text).slice(-CHAT_MEMORY_MESSAGES)]
  } catch {
    return [WELCOME_MESSAGE]
  }
}

function ChatWidget() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const historyKey = chatStorageKey(user)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [wallet, setWallet] = useState(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const listRef = useRef(null)
  const skipHistorySaveRef = useRef(false)

  useEffect(() => {
    skipHistorySaveRef.current = true
    setMessages(readChatHistory(historyKey))
  }, [historyKey])

  useEffect(() => {
    if (skipHistorySaveRef.current) {
      skipHistorySaveRef.current = false
      return
    }
    const recent = messages.filter((message, index) => index > 0 && message?.text).slice(-CHAT_MEMORY_MESSAGES)
    localStorage.setItem(historyKey, JSON.stringify(recent))
  }, [messages, historyKey])

  const applyWalletStatus = useCallback((nextWallet) => {
    setWallet(nextWallet)
    if ((nextWallet?.remainingFreeToday ?? 0) > 0 || (nextWallet?.purchasedQuestionsRemaining ?? 0) > 0) {
      setQuotaExceeded(false)
      setErrorMessage('')
    }
  }, [])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading, open, quotaExceeded])

  useEffect(() => {
    if (!open || !user) return
    apiClient
      .get('/chat/wallet', { auth: true })
      .then(applyWalletStatus)
      .catch(() => {})
  }, [open, user, location.pathname, applyWalletStatus])

  useEffect(() => onChatWalletUpdated(applyWalletStatus), [applyWalletStatus])

  useEffect(() => {
    if (!user) {
      setWallet(null)
      setQuotaExceeded(false)
    }
  }, [user])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || quotaExceeded) return

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await apiClient.post(
        '/chat',
        {
          messages: nextMessages.slice(-CHAT_MEMORY_MESSAGES),
          context: { page: location.pathname, profile },
        },
        { auth: true, timeoutMs: AI_REQUEST_TIMEOUT_MS },
      )

      if (data.wallet) applyWalletStatus(data.wallet)

      if (data.quotaExceeded) {
        setQuotaExceeded(true)
      } else {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          text: data.reply,
          toolsUsed: data.toolsUsed || [],
          responseMode: data.responseMode || 'agent',
          confidence: data.confidence,
          provider: data.provider,
          providerModel: data.providerModel,
          pendingActionToken: data.pendingActionToken,
        }])
        if (data.navigateTo) {
          setOpen(false)
          navigate(data.navigateTo)
        }
      }
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const remainingToday = wallet?.remainingFreeToday ?? null
  const purchasedRemaining = wallet?.purchasedQuestionsRemaining ?? 0

  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-20 z-50 flex h-[31rem] w-[23rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-[0_24px_70px_rgba(23,37,84,.22)]">
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500 border-b border-blue-500 px-4 py-3.5">
            <span className="flex items-center gap-1.5 text-sm font-black text-white">
              <SparklesIcon className="h-4 w-4 text-orange-300" />
              Trợ Lý HEALTHY SKIN
            </span>
            <div className="flex items-center gap-2">
              {user && wallet && (
                <span className="rounded-full bg-white border border-[#dbeafe] px-2.5 py-1 text-[11px] font-bold text-[#1d4ed8]">
                  {remainingToday > 0 ? `Còn ${remainingToday} câu hôm nay` : purchasedRemaining > 0 ? `${purchasedRemaining} câu đã mua` : 'Hết lượt hôm nay'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng khung chat"
                className="rounded-lg p-1 text-white/75 transition hover:bg-white/15 hover:text-white"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 bg-white">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-[#2563eb] text-white font-medium'
                      : 'bg-[#eff6ff] border border-[#dbeafe] text-[#172554]'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.responseMode && (
                    <p className="mt-1.5 text-[10px] font-semibold opacity-60">
                      {m.responseMode === 'keyword'
                        ? 'Phản hồi nhanh từ kịch bản có sẵn'
                        : m.responseMode === 'rag'
                          ? `Tra cứu từ kho kiến thức RAG${m.confidence != null ? ` · Khớp ${Math.round(m.confidence * 100)}%` : ''}`
                          : m.responseMode === 'rag_no_match'
                            ? 'Kho RAG không có kết quả đạt ngưỡng 85%'
                          : `Agent ${m.provider === 'groq' ? 'Groq' : m.provider === 'gemini' ? 'Gemini dự phòng' : 'nội bộ'}${m.toolsUsed?.length ? ` · ${m.toolsUsed.join(', ')}` : ''}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="rounded-2xl bg-[#eff6ff] border border-[#dbeafe] px-3.5 py-2 text-sm text-[#172554]/60">
                  Đang trả lời...
                </p>
              </div>
            )}
            {quotaExceeded && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 space-y-2.5">
                <p className="text-xs font-semibold text-amber-800">
                  Bạn đã dùng hết lượt hỏi miễn phí hôm nay. Nâng cấp Gói Trợ Lý để hỏi tiếp, hoặc đặt lịch với chuyên gia thật để được tư vấn sâu hơn.
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/pricing"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg bg-[#2563eb] px-3 py-1.5 text-center text-xs font-bold text-white hover:bg-[#1d4ed8]"
                  >
                    Nâng cấp Gói Trợ Lý
                  </Link>
                  <Link
                    to="/experts"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg bg-white border border-[#dbeafe] px-3 py-1.5 text-center text-xs font-bold text-[#1d4ed8] hover:bg-[#eff6ff]"
                  >
                    Đặt lịch chuyên gia
                  </Link>
                </div>
              </div>
            )}
            {errorMessage && (
              <p className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600">
                {errorMessage}
              </p>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#dbeafe] p-2.5 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={quotaExceeded ? 'Đã hết lượt hỏi hôm nay...' : 'Hỏi Trợ Lý...'}
              disabled={quotaExceeded}
              className="flex-1 rounded-xl bg-[#f8fbff] border border-[#dbeafe] px-3 py-2 text-sm text-[#172554] placeholder-[#172554]/40 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || quotaExceeded}
              aria-label="Gửi tin nhắn"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-white transition hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng Trợ Lý' : 'Mở Trợ Lý'}
        className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-[0_14px_30px_rgba(37,99,235,.32)] ring-4 ring-white transition-all duration-300 hover:-translate-y-1 hover:rotate-3"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatBubbleIcon className="h-6 w-6" />}
      </button>
    </>
  )
}

export default ChatWidget
