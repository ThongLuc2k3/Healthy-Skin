import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import RadioGroup from '../components/RadioGroup'
import CheckboxGroup from '../components/CheckboxGroup'
import ExtendedProfileSection from '../components/ExtendedProfileSection'
import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { SKIN_TYPES, ALLERGIES, CONDITIONS, GOALS, OTHER_OPTION_ID } from '../data/profileOptions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function OtherNoteInput({ id, label, value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mt-4 overflow-hidden"
    >
      <label htmlFor={id} className="block text-sm font-semibold text-[#172554]">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Mô tả bằng lời của bạn, AI sẽ dựa vào đây để hiểu rõ hơn..."
        className="mt-2 w-full rounded-2xl border border-[#E9EEF1] bg-[#F5FAFC] p-4 text-base text-[#172554] placeholder-[#5F7480]/60 transition-all duration-200 focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20 focus:outline-none"
      />
    </motion.div>
  )
}

function ProfileForm() {
  useDocumentTitle('Hồ sơ cá nhân')
  const { profile, setProfile } = useProfile()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [skinType, setSkinType] = useState(profile.skinType)
  const [allergies, setAllergies] = useState(profile.allergies)
  const [conditions, setConditions] = useState(profile.conditions)
  const [goals, setGoals] = useState(profile.goals)
  const [skinTypeNote, setSkinTypeNote] = useState(profile.skinTypeNote || '')
  const [allergiesNote, setAllergiesNote] = useState(profile.allergiesNote || '')
  const [conditionsNote, setConditionsNote] = useState(profile.conditionsNote || '')
  const [goalsNote, setGoalsNote] = useState(profile.goalsNote || '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (!skinType) {
      setError('Vui lòng chọn loại da trước khi tiếp tục.')
      return
    }

    const nextProfile = {
      skinType,
      allergies,
      conditions,
      goals,
      skinTypeNote: skinType === OTHER_OPTION_ID ? skinTypeNote : '',
      allergiesNote: allergies.includes(OTHER_OPTION_ID) ? allergiesNote : '',
      conditionsNote: conditions.includes(OTHER_OPTION_ID) ? conditionsNote : '',
      goalsNote: goals.includes(OTHER_OPTION_ID) ? goalsNote : '',
    }
    setProfile(nextProfile)
    navigate('/scan')
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F5FAFC] via-[#FDFDFB] to-[#F5FAFC] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      {/* Background Soft Radial Glowing Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-gradient-to-tr from-[#60a5fa]/15 via-[#BFD8CF]/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-[#D8B27A]/10 blur-3xl opacity-40" />
        <div className="absolute bottom-1/4 left-0 h-[450px] w-[450px] rounded-full bg-[#60a5fa]/12 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px]">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4"
        >
        
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#172554]">
            Hồ sơ cá nhân của bạn
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#5F7480] font-normal">
            Thông tin này chỉ dùng để cá nhân hóa gợi ý trên thiết bị của bạn. Không chắc chắn ở mục nào?
            Chọn "Khác" và mô tả bằng lời của bạn, AI sẽ dựa vào đó để hiểu rõ hơn.
          </p>
        </motion.div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="mt-12 space-y-8">
          {/* 1. Skin Type Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[28px] border border-[#E9EEF1] bg-[#FDFDFB] p-7 sm:p-10 shadow-[0_10px_30px_rgba(47, 169, 140,0.04)]"
          >
            <div className="space-y-1 mb-6">
              <h2 className="text-2xl font-bold text-[#172554]">
                Loại da <span className="text-rose-500">*</span>
              </h2>
              <p className="text-sm text-[#5F7480]">Chọn loại da chính xác nhất với bạn hiện tại</p>
            </div>

            <RadioGroup
              name="skinType"
              options={SKIN_TYPES}
              value={skinType}
              onChange={(value) => {
                setSkinType(value)
                setError('')
              }}
            />

            {skinType === OTHER_OPTION_ID && (
              <OtherNoteInput
                id="skinTypeNote"
                label="Mô tả làn da của bạn"
                value={skinTypeNote}
                onChange={setSkinTypeNote}
              />
            )}
          </motion.div>

          {/* 2. Allergies Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-[28px] border border-[#E9EEF1] bg-[#FDFDFB] p-7 sm:p-10 shadow-[0_10px_30px_rgba(47, 169, 140,0.04)]"
          >
            <div className="space-y-1 mb-6">
              <h2 className="text-2xl font-bold text-[#172554]">Dị ứng thực phẩm</h2>
              <p className="text-sm text-[#5F7480]">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
            </div>

            <CheckboxGroup
              name="allergies"
              options={ALLERGIES}
              values={allergies}
              onChange={setAllergies}
            />

            {allergies.includes(OTHER_OPTION_ID) && (
              <OtherNoteInput
                id="allergiesNote"
                label="Mô tả dị ứng của bạn"
                value={allergiesNote}
                onChange={setAllergiesNote}
              />
            )}
          </motion.div>

          {/* 3. Conditions Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-[28px] border border-[#E9EEF1] bg-[#FDFDFB] p-7 sm:p-10 shadow-[0_10px_30px_rgba(47, 169, 140,0.04)]"
          >
            <div className="space-y-1 mb-6">
              <h2 className="text-2xl font-bold text-[#172554]">Bệnh lý nền liên quan dinh dưỡng</h2>
              <p className="text-sm text-[#5F7480]">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
            </div>

            <CheckboxGroup
              name="conditions"
              options={CONDITIONS}
              values={conditions}
              onChange={setConditions}
            />

            {conditions.includes(OTHER_OPTION_ID) && (
              <OtherNoteInput
                id="conditionsNote"
                label="Mô tả bệnh lý nền của bạn"
                value={conditionsNote}
                onChange={setConditionsNote}
              />
            )}
          </motion.div>

          {/* 4. Goals Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-[28px] border border-[#E9EEF1] bg-[#FDFDFB] p-7 sm:p-10 shadow-[0_10px_30px_rgba(47, 169, 140,0.04)]"
          >
            <div className="space-y-1 mb-6">
              <h2 className="text-2xl font-bold text-[#172554]">Mục tiêu của bạn</h2>
              <p className="text-sm text-[#5F7480]">Chọn tất cả những gì phù hợp (không bắt buộc)</p>
            </div>

            <CheckboxGroup name="goals" options={GOALS} values={goals} onChange={setGoals} />

            {goals.includes(OTHER_OPTION_ID) && (
              <OtherNoteInput
                id="goalsNote"
                label="Mô tả mục tiêu của bạn"
                value={goalsNote}
                onChange={setGoalsNote}
              />
            )}
          </motion.div>

          {/* 5. Extended Profile Section for logged in users */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="rounded-[28px] border border-[#E9EEF1] bg-[#FDFDFB] p-7 sm:p-10 shadow-[0_10px_30px_rgba(47, 169, 140,0.04)]"
            >
              <ExtendedProfileSection />
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-semibold text-rose-700 shadow-xs"
            >
              {error}
            </motion.p>
          )}

          {/* Action / Submit Button - Animated Glass Button */}
          <div className="flex justify-center pt-4 pb-8">
            <motion.button
              type="submit"
              whileHover={
                {
                  backgroundPosition: 'right center',
                }
              }
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative inline-flex w-full sm:w-auto min-w-[300px] items-center justify-center gap-2 overflow-hidden rounded-full text-lg font-bold text-white transition-colors cursor-pointer"
              style={{
                padding: '16px 40px',
                backgroundImage:
                  'linear-gradient(to right, #2563eb 0%, #60a5fa 51%, #2563eb 100%)',
                backgroundSize: '200% auto',
                border: 'none',
                outline: 'none',
                boxShadow: '0 10px 30px rgba(47, 169, 140,0.3)',
                transition: '0.5s',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-display tracking-wide drop-shadow-sm">
                Lưu thông tin
              </span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileForm
