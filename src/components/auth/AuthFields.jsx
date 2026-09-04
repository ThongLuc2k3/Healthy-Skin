import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function FloatingInput({
  label,
  icon,
  isPassword = false,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  id,
  required,
  minLength,
  autoComplete,
  ...rest
}) {
  const [focused, setFocused] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [typed, setTyped] = useState(String(value ?? defaultValue ?? ''))

  const currentVal = value !== undefined ? String(value) : typed
  const isFloating = focused || currentVal.length > 0
  const inputType = isPassword ? (reveal ? 'text' : 'password') : type

  return (
    <div className="relative">
      <AnimatePresence>
        {focused && (
          <motion.span
            initial={{ opacity: 0, x: -8, scale: 0.7 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.7 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -left-7 top-1/2 hidden -translate-y-1/2 sm:flex items-center gap-1 z-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2563eb]/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563eb]" />
            </span>
          </motion.span>
        )}
      </AnimatePresence>

      <div className="relative flex items-center">
        {icon && (
          <span
            className={`pointer-events-none absolute left-4 transition-all duration-300 ${
              isFloating ? 'text-[#2563eb]' : 'text-[#94a3b8]'
            }`}
          >
            {icon}
          </span>
        )}

        <input
          {...rest}
          id={id}
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          onChange={(e) => {
            setTyped(e.target.value)
            onChange?.(e)
          }}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          className={`peer h-14 w-full rounded-xl bg-white text-[#172554] font-semibold placeholder-transparent transition-all duration-300 ${
            icon ? 'pl-12' : 'pl-4'
          } pr-12 outline-none border ${
            focused ? 'border-[#2563eb] shadow-[0_0_20px_rgba(47,169,140,0.25)]' : 'border-[#dbeafe]'
          } hover:border-[#2563eb]/60`}
          placeholder={label}
        />

        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            y: isFloating ? -22 : 0,
            scale: isFloating ? 0.78 : 1,
            color: focused ? '#2563eb' : '#94a3b8',
          }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`pointer-events-none absolute top-1/2 origin-left font-medium ${
            icon ? 'left-12' : 'left-4'
          }`}
          style={{ marginTop: '-0.55rem' }}
        >
          {label}
        </motion.label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="absolute right-3 grid h-8 w-8 place-items-center rounded-lg text-[#94a3b8] transition-colors hover:text-[#2563eb]"
            aria-label={reveal ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            tabIndex={-1}
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        <motion.span
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#2563eb] shadow-xs"
          initial={false}
          animate={{ width: focused ? '100%' : '0%' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

export function GlassButton({
  children,
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  onClick,
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={
        disabled || loading
          ? {}
          : {
              backgroundPosition: 'right center',
              color: '#ffffff',
              textDecoration: 'none',
            }
      }
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{
        display: 'flex',
        margin: '12px auto',
        padding: '14px 40px',
        backgroundImage: 'linear-gradient(to right, #2563eb 0%, #1d4ed8 51%, #2563eb 100%)',
        backgroundSize: '200% auto',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        borderRadius: '12px',
        boxShadow: '0 6px 25px rgba(47, 169, 140, 0.35)',
        transition: '0.5s',
        textTransform: 'uppercase',
        color: 'white',
      }}
    >
      <motion.span
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        aria-hidden
      />
      <span className="relative z-10 flex items-center gap-2 text-white font-extrabold">
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : children}
      </span>
    </motion.button>
  )
}

