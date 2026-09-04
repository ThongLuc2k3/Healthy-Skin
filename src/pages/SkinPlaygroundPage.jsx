import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GamepadIcon,
  SparklesIcon,
  TrophyIcon,
  CheckCircleIcon,
  FlameIcon,
  TargetIcon,
  StarIcon,
} from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../lib/apiClient'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const QUESTIONS = [
  {
    id: 'after_wash',
    question: 'Sau khi rửa mặt xong 20 phút, da bạn thường thế nào?',
    options: [
      { id: 'tight', label: 'Căng, khô, hơi rít' },
      { id: 'balanced', label: 'Khá thoải mái, không quá bóng' },
      { id: 'shiny', label: 'Bóng dầu lại khá nhanh' },
    ],
  },
  {
    id: 'midday',
    question: 'Tới giữa trưa, vùng chữ T của bạn thường ra sao?',
    options: [
      { id: 'dry', label: 'Ít thay đổi, vẫn khá khô' },
      { id: 'mixed', label: 'Hơi dầu vùng mũi/trán' },
      { id: 'oily', label: 'Bóng rõ, dễ bí' },
    ],
  },
  {
    id: 'new_product',
    question: 'Khi thử sản phẩm mới, da bạn phản ứng thế nào?',
    options: [
      { id: 'easy', label: 'Khá dễ thích nghi' },
      { id: 'careful', label: 'Phải test kỹ một chút' },
      { id: 'reactive', label: 'Dễ đỏ, châm chích hoặc nổi mẩn' },
    ],
  },
]

const DAILY_CHALLENGES = [
  'Hôm nay uống đủ 2 bình nước trước 17:00.',
  'Kiểm tra hạn dùng 1 sản phẩm skincare đang để quá lâu.',
  'Đổi khăn mặt/vỏ gối sạch để giảm bí tắc da.',
  'Chốt 1 bữa tối ít đồ chiên và nhiều rau hơn thường lệ.',
]

function FloatingBlob({ className }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

function SkinPlaygroundPage() {
  useDocumentTitle('Skin Lab')
  const { user } = useAuth()
  const [answers, setAnswers] = useState({})
  const [pickedChallenge, setPickedChallenge] = useState(DAILY_CHALLENGES[0])
  const [rewardClaimed, setRewardClaimed] = useState(false)
  const [rewardMessage, setRewardMessage] = useState('')

  const answeredCount = Object.keys(answers).length
  const progressPercent = Math.round((answeredCount / QUESTIONS.length) * 100)

  const result = useMemo(() => {
    const values = Object.values(answers)
    if (values.length < QUESTIONS.length) return null

    const score = {
      dry: values.filter((v) => ['tight', 'dry'].includes(v)).length,
      oily: values.filter((v) => ['shiny', 'oily'].includes(v)).length,
      sensitive: values.filter((v) => ['careful', 'reactive'].includes(v)).length,
    }

    if (score.sensitive >= 1) {
      return {
        title: 'Thiên hướng da nhạy cảm',
        tip: 'Giữ routine ít bước, test sản phẩm mới chậm hơn và đừng đổi quá nhiều món cùng lúc.',
        badge: 'Cảnh báo nhẹ',
        confidence: '95% Match',
        chips: ['Ít bước', 'Dịu nhẹ', 'Test kỹ'],
      }
    }
    if (score.oily > score.dry) {
      return {
        title: 'Thiên hướng da dầu / hỗn hợp dầu',
        tip: 'Ưu tiên cân bằng dầu, làm sạch dịu nhẹ và đừng quên dưỡng ẩm mỏng nhẹ dạng gel.',
        badge: 'Cân bằng dầu',
        confidence: '98% Match',
        chips: ['Kiềm dầu', 'Làm sạch sâu', 'Dạng gel'],
      }
    }
    return {
      title: 'Thiên hướng da thường / khô',
      tip: 'Tập trung khóa ẩm, giảm tẩy rửa mạnh và giữ da đủ nước suốt cả ngày dài.',
      badge: 'Cấp ẩm sâu',
      confidence: '96% Match',
      chips: ['Khóa ẩm', 'Dưỡng sâu', 'Mềm mịn'],
    }
  }, [answers])

  useEffect(() => {
    if (!result || rewardClaimed || !user) return
    setRewardClaimed(true)
    apiClient
      .post('/vouchers/game-reward', {}, { auth: true })
      .then(() => setRewardMessage('Bạn vừa nhận 1 voucher vào Kho Voucher vì hoàn thành trắc nghiệm!'))
      .catch(() => {})
  }, [result, rewardClaimed, user])

  function shuffleChallenge() {
    const next = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)]
    setPickedChallenge(next)
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F0FAFA 0%, #EBF8F5 60%, #F7F3EE 100%)' }}
    >
      {/* Background ambient radial glow layers */}
      <FloatingBlob className="w-[600px] h-[600px] bg-[#93c5fd]/30 -top-40 -left-40" />
      <FloatingBlob className="w-[500px] h-[500px] bg-[#dbeafe]/40 top-1/3 -right-40" />
      <FloatingBlob className="w-[400px] h-[400px] bg-amber-100/20 bottom-10 left-1/4" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 pt-28 space-y-8">
        {/* ── Hero Section ───────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <div className="rounded-3xl p-8 sm:p-10 border border-[#dbeafe] bg-white/70 backdrop-blur-xl shadow-[0_8px_48px_rgba(47, 169, 140,0.10)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 via-transparent to-[#D8B27A]/5 pointer-events-none" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] items-center">
              <div>
                
                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#172554] leading-tight">
                  Chơi nhanh để hiểu da mình hơn
                </h1>
                <p className="mt-3 text-base leading-relaxed text-[#64748B] max-w-xl">
                  Trải nghiệm bài trắc nghiệm tương tác siêu ngắn giúp phân tích nhanh xu hướng làn da và thử thách thói quen mỗi ngày cùng AI.
                </p>

                {/* Progress bar inside hero */}
                <div className="mt-6 space-y-2 max-w-md">
                  <div className="flex justify-between text-xs font-bold text-[#172554]">
                    <span>Tiến trình trắc nghiệm</span>
                    <span className="text-[#2563eb]">
                      {answeredCount}/{QUESTIONS.length} câu hoàn thành
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#dbeafe] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </div>

              {/* Decorative 3D CSS Objects */}
              <div className="relative h-48 w-full flex items-center justify-center lg:justify-end pointer-events-none">
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative h-36 w-36 rounded-3xl bg-gradient-to-br from-white/90 via-[#eff6ff] to-[#dbeafe]/50 border border-white/80 backdrop-blur-xl shadow-[0_16px_40px_rgba(112, 196, 175,0.25)] flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#2563eb]/30 to-[#60a5fa]/60 border border-white/60 backdrop-blur-md shadow-[0_0_20px_rgba(47, 169, 140,0.3)] flex items-center justify-center"
                  >
                    <GamepadIcon className="h-10 w-10 text-[#2563eb]" />
                  </motion.div>
                </motion.div>

                {/* Floating CSS Capsule */}
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [0, -4, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-2 right-12 h-14 w-28 rounded-full bg-gradient-to-r from-[#D8B27A]/40 to-[#BFD8CF]/50 border border-white/70 backdrop-blur-lg shadow-lg flex items-center justify-center"
                >
                  <SparklesIcon className="h-6 w-6 text-[#f97316]" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Main Layout (Left: Questions, Right: Results & Gamification) ── */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ── LEFT COLUMN: QUESTIONS ────────────────────────── */}
          <section className="space-y-6">
            <div className="rounded-3xl border border-[#dbeafe] bg-white/70 backdrop-blur-xl shadow-[0_4px_32px_rgba(47, 169, 140,0.10)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold tracking-widest text-[#2563eb] uppercase">
                  TRẮC NGHIỆM TƯƠNG TÁC
                </span>
                <span className="text-xs font-bold text-[#64748B]">
                  {answeredCount === QUESTIONS.length ? 'Đã hoàn thành 🎉' : 'Đang thực hiện'}
                </span>
              </div>

              <div className="space-y-6">
                {QUESTIONS.map((question, index) => {
                  const isAnswered = answers[question.id] !== undefined
                  return (
                    <motion.div
                      key={question.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      custom={index + 1}
                      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
                        isAnswered
                          ? 'border-[#2563eb]/40 bg-gradient-to-br from-[#eff6ff]/80 to-[#dbeafe]/60 shadow-sm'
                          : 'border-[#dbeafe] bg-white/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#2563eb]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563eb]/10 text-[11px]">
                            {index + 1}
                          </span>
                          Câu hỏi {index + 1}
                        </span>
                        {isAnswered && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <CheckCircleIcon className="h-4 w-4" /> Đã chọn
                          </span>
                        )}
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-[#172554]">
                        {question.question}
                      </h2>

                      <div className="mt-4 grid gap-3">
                        {question.options.map((option) => {
                          const isSelected = answers[question.id] === option.id
                          return (
                            <motion.button
                              key={option.id}
                              type="button"
                              whileHover={{ scale: 1.01, y: -1 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() =>
                                setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                              }
                              className={`relative rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                                isSelected
                                  ? 'border-[#2563eb] bg-gradient-to-r from-[#2563eb] to-[#60a5fa] text-white shadow-[0_4px_20px_rgba(47, 169, 140,0.3)]'
                                  : 'border-[#dbeafe] bg-white/90 text-[#172554] hover:border-[#2563eb]/40 hover:bg-[#eff6ff]/60'
                              }`}
                            >
                              <span>{option.label}</span>
                              <div
                                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected ? 'border-white bg-white/20' : 'border-[#BFD8CF]'
                                }`}
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-2.5 w-2.5 rounded-full bg-white"
                                  />
                                )}
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ── RIGHT COLUMN: RESULTS & GAMIFICATION ───────────── */}
          <aside className="space-y-6">
            {/* AI Analysis Result Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              <div className="rounded-3xl border border-[#dbeafe] bg-white/70 backdrop-blur-xl shadow-[0_4px_32px_rgba(47, 169, 140,0.10)] p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#2563eb] uppercase">
                    <SparklesIcon className="h-4 w-4 text-[#2563eb]" /> KẾT QUẢ MINI QUIZ
                  </span>
                  {result && (
                    <span className="rounded-full bg-[#2563eb]/10 border border-[#2563eb]/20 px-3 py-0.5 text-xs font-bold text-[#2563eb]">
                      {result.confidence}
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key={result.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      className="space-y-4 pt-2"
                    >
                      <div className="inline-block rounded-full bg-gradient-to-r from-[#2563eb]/10 to-[#60a5fa]/20 border border-[#2563eb]/30 px-3.5 py-1 text-xs font-extrabold text-[#2563eb]">
                        {result.badge}
                      </div>
                      <h2 className="text-2xl font-extrabold text-[#172554] leading-tight">
                        {result.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-[#64748B]">
                        {result.tip}
                      </p>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#dbeafe]">
                        {result.chips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full bg-[#eff6ff] border border-[#dbeafe] px-3 py-1 text-xs font-semibold text-[#2563eb]"
                          >
                            ✓ {chip}
                          </span>
                        ))}
                      </div>

                      {rewardMessage && (
                        <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">
                          {rewardMessage}
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <div className="py-6 text-center space-y-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                        <TargetIcon className="h-7 w-7" />
                      </div>
                      <p className="text-sm leading-relaxed text-[#64748B]">
                        Trả lời đủ 3 câu hỏi bên trái để mở khóa nhận diện xu hướng làn da và gợi ý chăm sóc chuẩn AI.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Daily Challenge Card (Mission Style) */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <div className="rounded-3xl border border-[#dbeafe] bg-white/70 backdrop-blur-xl shadow-[0_4px_32px_rgba(47, 169, 140,0.10)] p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#2563eb] uppercase">
                    <TrophyIcon className="h-4 w-4 text-amber-500" /> THỬ THÁCH HÔM NAY
                  </span>
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-bold text-amber-700">
                    Nhiệm vụ +15 XP
                  </span>
                </div>

                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/80 p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <FlameIcon className="h-4 w-4 text-amber-500" />
                    <span>Nhiệm vụ hàng ngày</span>
                  </div>
                  <p className="text-base font-bold text-[#172554] leading-relaxed">
                    {pickedChallenge}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundPosition: 'right center' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.5 }}
                  type="button"
                  onClick={shuffleChallenge}
                  className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-md transition"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #2563eb 0%, #60a5fa 51%, #2563eb 100%)',
                    backgroundSize: '200% auto',
                  }}
                >
                  Đổi thử thách khác
                </motion.button>
              </div>
            </motion.div>

            {/* Achievement Badges Section */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
              <div className="rounded-3xl border border-[#dbeafe] bg-white/70 backdrop-blur-xl shadow-[0_4px_32px_rgba(47, 169, 140,0.10)] p-6 sm:p-7 space-y-4">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#2563eb] uppercase">
                  <StarIcon className="h-4 w-4 text-amber-500" /> HUY HIỆU SKIN LAB
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { title: 'Lab Explorer', icon: '🔬', unlocked: true },
                    { title: 'Habit Pioneer', icon: '🌿', unlocked: true },
                    { title: 'Skin Scholar', icon: '💎', unlocked: answeredCount === 3 },
                  ].map((badge, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -2 }}
                      className={`rounded-2xl p-3 text-center border transition-all ${
                        badge.unlocked
                          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm'
                          : 'border-[#dbeafe] bg-white/40 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <p className="text-xs font-extrabold text-[#172554] truncate">
                        {badge.title}
                      </p>
                      <span className="text-[10px] font-bold text-[#94A3B8]">
                        {badge.unlocked ? 'Đã mở' : 'Khóa'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default SkinPlaygroundPage
