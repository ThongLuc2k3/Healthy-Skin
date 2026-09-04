import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function Reveal({ children, delay = 0, y = 40, className = '', once = true }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ children }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
        {children}
      </span>
    </div>
  )
}

export function SectionTitle({ eyebrow, title, description, align = 'center' }) {
  return (
    <div
      className={
        align === 'center'
          ? 'flex flex-col items-center text-center mx-auto max-w-3xl'
          : 'flex flex-col items-start text-left max-w-2xl'
      }
    >
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className="mt-6 font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.045em]">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}

export function GlassPanel({ children, className = '', strong = false }) {
  return (
    <div className={`${strong ? 'glass-strong' : 'glass'} rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

export function Corners({ color = '#2563eb' }) {
  const base = 'absolute h-3 w-3'
  return (
    <>
      <span className={`${base} top-0 left-0 border-l-2 border-t-2`} style={{ borderColor: color }} />
      <span className={`${base} top-0 right-0 border-r-2 border-t-2`} style={{ borderColor: color }} />
      <span className={`${base} bottom-0 left-0 border-l-2 border-b-2`} style={{ borderColor: color }} />
      <span className={`${base} bottom-0 right-0 border-r-2 border-b-2`} style={{ borderColor: color }} />
    </>
  )
}

