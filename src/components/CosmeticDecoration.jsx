import { motion } from 'framer-motion'

/**
 * ============================================================================
 * APPLE-GRADE ANIMATED SVG COSMETIC ILLUSTRATIONS & GLASS CARDS
 * ============================================================================
 * 60 FPS GPU-accelerated micro-animations, glassmorphism, & Framer Motion.
 */

// ----------------------------------------------------------------------------
// 1. CREAM JAR ILLUSTRATION (Lid opens 12°, cream pops slightly, lid closes)
// ----------------------------------------------------------------------------
export function CreamJarIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="cream_glass_bg" x1="10" y1="20" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="cream_lid_grad" x1="14" y1="12" x2="50" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#172554" />
            <stop offset="50%" stopColor="#135c70" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="cream_swirl_grad" x1="20" y1="20" x2="44" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <filter id="cream_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#172554" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Jar Base Shadow */}
        <ellipse cx="32" cy="54" rx="20" ry="4" fill="#172554" opacity="0.18" />

        {/* Jar Glass Body */}
        <path
          d="M14 26C14 22 20 20 32 20C44 20 50 22 50 26V46C50 51.5 42 55 32 55C22 55 14 51.5 14 46V26Z"
          fill="url(#cream_glass_bg)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
          filter="url(#cream_shadow)"
        />

        {/* Specular Highlight Streak */}
        <path d="M18 28V44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

        {/* Animated Cream Swirl Pop */}
        <motion.ellipse
          cx="32"
          cy="23"
          rx="15"
          ry="6"
          fill="url(#cream_swirl_grad)"
          animate={{
            scale: [1, 1.08, 1],
            cy: [23, 21.5, 23],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />

        {/* Animated Lid Opening 12° Micro-Animation */}
        <motion.g
          style={{ originX: '14px', originY: '20px' }}
          animate={{ rotate: [0, -12, 0] }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {/* Lid Ring */}
          <path
            d="M12 16C12 13 20 12 32 12C44 12 52 13 52 16V22C52 25 44 26 32 26C20 26 12 25 12 22V16Z"
            fill="url(#cream_lid_grad)"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.2"
          />
          {/* Lid Top Specular Line */}
          <ellipse cx="32" cy="15" rx="16" ry="3" fill="#ffffff" opacity="0.4" />
        </motion.g>
      </svg>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 2. LOTION PUMP BOTTLE (Pump head presses down & spring returns)
// ----------------------------------------------------------------------------
export function LotionPumpIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="lotion_bottle_grad" x1="16" y1="24" x2="48" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="lotion_pump_head" x1="20" y1="8" x2="38" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#172554" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="32" cy="58" rx="16" ry="3.5" fill="#172554" opacity="0.2" />

        {/* Bottle Body */}
        <path
          d="M20 24H44C46.5 24 48 25.8 48 28V52C48 56.4 44.4 60 40 60H24C19.6 60 16 56.4 16 52V28C16 25.8 17.5 24 20 24Z"
          fill="url(#lotion_bottle_grad)"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.5"
        />

        {/* Front Label Plate */}
        <rect x="22" y="32" width="20" height="20" rx="4" fill="#ffffff" fillOpacity="0.9" />
        <rect x="25" y="36" width="14" height="2" rx="1" fill="#172554" />
        <circle cx="32" cy="44" r="3" fill="#93c5fd" />

        {/* Specular Highlight */}
        <path d="M19 28V52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* Pump Neck Ring */}
        <rect x="28" y="20" width="8" height="4" fill="#ffffff" opacity="0.9" />

        {/* Animated Pressing Pump Head */}
        <motion.g
          animate={{ y: [0, 4.5, 0] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <path d="M22 10H38V14H34V20H30V14H22V10Z" fill="url(#lotion_pump_head)" />
          <path d="M14 12H24V14H14V12Z" fill="#93c5fd" />
          {/* Droplet from Spout */}
          <motion.circle
            cx="15"
            cy="17"
            r="1.5"
            fill="#93c5fd"
            animate={{ opacity: [0, 1, 0], y: [0, 5, 10] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.g>
      </svg>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 3. MOISTURIZER TUBE ILLUSTRATION (Hydration water drop)
// ----------------------------------------------------------------------------
export function MoisturizerTubeIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="moist_body_grad" x1="16" y1="12" x2="48" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="moist_drop_grad" x1="26" y1="24" x2="38" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
        </defs>

        <ellipse cx="32" cy="58" rx="14" ry="3" fill="#172554" opacity="0.2" />

        {/* Tube Cap */}
        <path d="M24 6H40V12H24V6Z" fill="#172554" />

        {/* Tube Body */}
        <path
          d="M20 12H44L48 50C48 54.4 44.4 58 40 58H24C19.6 58 16 54.4 16 50L20 12Z"
          fill="url(#moist_body_grad)"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.5"
        />

        {/* Front Water Drop Emblem */}
        <motion.path
          d="M32 24C28 32 26 36 26 40C26 43.3 28.7 46 32 46C35.3 46 38 43.3 38 40C38 36 36 32 32 24Z"
          fill="url(#moist_drop_grad)"
          animate={{ scale: [0.95, 1.08, 0.95] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '32px', originY: '37px' }}
        />

        {/* Specular Highlight */}
        <path d="M19 18L22 48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 4. SUNSCREEN TUBE ILLUSTRATION (Sun rays rotate continuously)
// ----------------------------------------------------------------------------
export function SunscreenTubeIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="sun_tube_grad" x1="16" y1="14" x2="48" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
        </defs>

        <ellipse cx="32" cy="58" rx="14" ry="3" fill="#172554" opacity="0.2" />

        {/* Cap */}
        <rect x="24" y="6" width="16" height="8" rx="2" fill="#D97706" />

        {/* Tube */}
        <path
          d="M20 14H44L48 52C48 56.4 44.4 60 40 60H24C19.6 60 16 56.4 16 52L20 14Z"
          fill="url(#sun_tube_grad)"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.5"
        />

        {/* Sun Core Center */}
        <circle cx="32" cy="38" r="7" fill="#FCD34D" />

        {/* Rotating Sun Rays Micro-Animation */}
        <motion.g
          style={{ originX: '32px', originY: '38px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <path
            d="M32 26V29M32 47V50M20 38H23M41 38H44M23 29L25 31M39 45L41 47M23 47L25 45M39 29L41 31"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 5. SERUM DROPPER ILLUSTRATION (Drop grows, falls, new drop appears)
// ----------------------------------------------------------------------------
export function SerumDropperIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="serum_glass_grad" x1="22" y1="18" x2="42" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="serum_fill" x1="26" y1="26" x2="38" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#0077b6" />
          </linearGradient>
        </defs>

        <ellipse cx="32" cy="58" rx="12" ry="3" fill="#172554" opacity="0.2" />

        {/* Serum Bottle Base */}
        <path
          d="M22 22C22 20 24 18 26 18H38C40 18 42 20 42 22V52C42 56.4 38.4 60 34 60H30C25.6 60 22 56.4 22 52V22Z"
          fill="url(#serum_glass_grad)"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.5"
        />

        <path d="M26 28H38V48C38 50.2 36.2 52 34 52H30C27.8 52 26 50.2 26 48V28Z" fill="url(#serum_fill)" opacity="0.85" />

        {/* Rubber Bulb Top */}
        <rect x="26" y="6" width="12" height="8" rx="3" fill="#172554" />
        <rect x="28" y="14" width="8" height="4" fill="#2563eb" />

        {/* Animated Dropper Drop Falling Micro-Animation */}
        <motion.circle
          cx="32"
          cy="38"
          r="3"
          fill="#ffffff"
          animate={{
            scale: [0.6, 1.2, 0.8],
            y: [0, 8, 14],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 6. ALCOHOL FREE BADGE ILLUSTRATION (Water drop gently sways)
// ----------------------------------------------------------------------------
export function AlcoholFreeIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="alc_drop_grad" x1="16" y1="8" x2="48" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Animated Swaying Water Drop */}
        <motion.g
          style={{ originX: '32px', originY: '12px' }}
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M32 8C20 24 16 34 16 42C16 50.8 23.2 58 32 58C40.8 58 48 50.8 48 42C48 34 44 24 32 8Z"
            fill="url(#alc_drop_grad)"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.5"
          />

          {/* Green Leaf Badge */}
          <path d="M26 38C26 30 36 28 38 34C34 35 30 38 26 38Z" fill="#10B981" />

          {/* 0% Text Plate */}
          <circle cx="32" cy="44" r="9" fill="#ffffff" opacity="0.95" />
          <text x="32" y="47.5" fill="#172554" fontSize="9.5" fontWeight="900" textAnchor="middle">
            0%
          </text>
        </motion.g>
      </svg>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 7. SKIN CHECK ILLUSTRATION (Magnifying glass scans left to right)
// ----------------------------------------------------------------------------
export function SkinCheckIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="skin_bg_grad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Rounded Square Card Background */}
        <rect x="12" y="12" width="40" height="40" rx="12" fill="url(#skin_bg_grad)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />

        {/* Skin Mesh Texture Grid */}
        <path d="M20 24H44M20 32H44M20 40H44" stroke="#2563eb" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />

        {/* Animated Scanning Magnifying Glass */}
        <motion.g
          animate={{ x: [-4, 4, -4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="30" cy="30" r="13" fill="none" stroke="#2563eb" strokeWidth="3.5" />
          <line x1="40" y1="40" x2="52" y2="52" stroke="#172554" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M24 30L28 34L36 24" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </svg>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 8. COSMETIC SET ILLUSTRATION (Lipstick rises & compact lid opens)
// ----------------------------------------------------------------------------
export function CosmeticSetIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Foundation Bottle Base */}
        <rect x="12" y="24" width="14" height="28" rx="4" fill="#93c5fd" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
        <rect x="15" y="16" width="8" height="8" rx="2" fill="#172554" />

        {/* Animated Rising Lipstick Bullet */}
        <g>
          <rect x="32" y="32" width="10" height="20" rx="3" fill="#172554" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
          <motion.path
            d="M34 18L40 22V32H34V18Z"
            fill="#F43F5E"
            animate={{ y: [0, -3.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>

        {/* Powder Compact Lid Opening */}
        <g>
          <ellipse cx="48" cy="46" rx="12" ry="8" fill="#10B981" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
          <motion.ellipse
            cx="48"
            cy="44"
            rx="9"
            ry="4.5"
            fill="#FDE68A"
            animate={{ scaleY: [1, 1.25, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '48px', originY: '44px' }}
          />
        </g>
      </svg>
    </div>
  )
}

// 9. PRODUCT DURABILITY ILLUSTRATION (Durability shield & 12M checkmark)
export function ProductDurabilityIllustration({ className = "h-8 w-8" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="dur_jar_grad" x1="14" y1="20" x2="50" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <ellipse cx="32" cy="54" rx="14" ry="3" fill="#172554" opacity="0.2" />

        {/* Jar Base */}
        <path
          d="M14 26C14 22 20 20 32 20C44 20 50 22 50 26V46C50 51 42 54 32 54C22 54 14 51 14 46V26Z"
          fill="url(#dur_jar_grad)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
        />
        <path d="M18 16L32 10L46 16V22H18V16Z" fill="#172554" />

        {/* Animated 12M Durability Badge */}
        <motion.g
          animate={{ scale: [0.95, 1.06, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '44px', originY: '42px' }}
        >
          <circle cx="44" cy="42" r="11" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
          <path d="M38 42L41 45L49 37" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
        <text x="32" y="38" fill="#172554" fontSize="11" fontWeight="900" textAnchor="middle">12M</text>
      </svg>
    </div>
  )
}
export const ProductDurabilityIcon = ProductDurabilityIllustration

// ============================================================================
// PREMIUM CARD REVEAL & INTERACTIVE MOTION CONTAINER
// ============================================================================

/**
 * Framer Motion Card Variants
 * Reveal Sequence: Hidden -> Blur -> Translate Upward -> Scale 0.75 -> Spring Bounce -> Settle -> Idle Float
 */
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.75,
    filter: 'blur(12px)',
    rotate: -4,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    rotate: 0,
    transition: {
      duration: 0.9,
      delay,
      type: 'spring',
      stiffness: 240,
      damping: 22,
    },
  }),
}

export function FloatingCosmeticItem({
  IconComponent,
  name,
  category,
  badgeText = 'Phù hợp 98%',
  badgeColor = 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40',
  glowColor = 'from-[#2563eb]/20 to-[#10B981]/20',
  duration = 6,
  delay = 0,
  className = '',
  style = {},
}) {
  return (
    <motion.div
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`pointer-events-none absolute z-10 hidden lg:block ${className}`}
      style={style}
    >
      {/* Soft Idle Floating (2-4px y floating, 1.01 breathing scale) */}
      <motion.div
        animate={{
          y: [-3, 3, -3],
          rotate: [-1, 1, -1],
          scale: [1, 1.015, 1],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
          delay,
        }}
        whileHover={{
          y: -6,
          scale: 1.03,
          rotate: -1.5,
          transition: { duration: 0.25, ease: 'easeOut' },
        }}
        className="group pointer-events-auto relative flex items-center gap-3.5 rounded-2xl glass p-3.5 border border-white/90 shadow-lg backdrop-blur-xl transition-shadow hover:shadow-2xl"
      >
        {/* Animated Expanding Glow Backdrop */}
        <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${glowColor} blur-xl opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Specular Sheen Highlight Sweep across Glass Card */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />

        {/* Icon Wrapper with Independent Animation */}
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/85 shadow-inner border border-white group-hover:scale-105 transition-transform duration-300">
          <IconComponent className="h-7 w-7" />
        </div>

        {/* Badge Content */}
        <div className="relative pr-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-black text-[#082531]">{name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black border ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] font-bold text-[#172554]/80">{category}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
