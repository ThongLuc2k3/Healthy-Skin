import React, { useId, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/**
 * ============================================================================
 * COSMETIC DECORATION SYSTEM
 * ----------------------------------------------------------------------------
 * A fully vector (no PNG/JPG/GIF) illustration + motion system for an AI
 * skincare landing page. Every product is built from raw SVG primitives
 * (rect, circle, ellipse, path, line, polygon) with gradients, filters and
 * clip/masks for a soft glassmorphism finish, gold trims, glass reflections,
 * moving shine sweeps and twinkling sparkles for a premium, editorial feel.
 *
 * Default render size is ~200px per icon (see DEFAULT_ICON_SIZE below).
 *
 * Motion language (Apple / Linear / Vercel / Arc / Figma Smart Animate style):
 *   hidden -> blur -> translateY -> scale(0.75) -> slight rotate -> spring
 *   bounce -> settle -> idle floating
 *
 * Each icon owns an independent "alive" micro-animation (lid opening, pump
 * pressing, drop falling, sun rotating, lens scanning, roller spinning,
 * mist spraying, cap twisting...) plus ambient lighting effects (shine
 * sweep, gradient breathing, sparkle twinkle) that run on infinite loops,
 * decoupled from the entrance/hover animation so the motion systems never
 * fight each other.
 * ============================================================================
 */

// True ~200px default size for every standalone icon
const DEFAULT_ICON_SIZE = "w-[200px] h-[200px]";

/* ----------------------------------------------------------------------------
 * SHARED MOTION VARIANTS
 * -------------------------------------------------------------------------- */

// Entrance: hidden -> blur -> translate up -> scale up -> rotate settle -> spring bounce
const cardRevealVariants = {
  hidden: {
    opacity: 0,
    y: 46,
    scale: 0.75,
    rotate: -7,
    filter: "blur(14px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 19, mass: 0.9 },
  },
};

// Ambient glow behind the icon, "breathes" and expands further on hover
const glowVariants = {
  rest: { opacity: 0.5, scale: 1 },
  hover: { opacity: 0.85, scale: 1.3, transition: { duration: 0.5, ease: "easeOut" } },
};

// Idle floating for the icon only (2-4px translate + subtle breathing scale + soft rotation)
const idleFloat = {
  animate: {
    y: [0, -4, 0, 3, 0],
    rotate: [0, 1, 0, -1, 0],
    scale: [1, 1.015, 1, 1.01, 1],
    transition: { duration: 6.5, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ----------------------------------------------------------------------------
 * REUSABLE LIGHTING PRIMITIVES
 * -------------------------------------------------------------------------- */

// A diagonal moving highlight ("shine sweep") clipped to whatever shape wraps it
function ShineSweep({ clipId, x0 = -40, x1 = 240, y = 0, height = 220, duration = 3.4, delay = 0 }) {
  return (
    <g clipPath={`url(#${clipId})`}>
      <motion.rect
        x={x0}
        y={y}
        width="26"
        height={height}
        fill="#ffffff"
        opacity="0.35"
        transform="skewX(-18)"
        animate={{ x: [x0, x1] }}
        transition={{ duration, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut", delay }}
      />
    </g>
  );
}

/* ----------------------------------------------------------------------------
 * 1) CREAM JAR, glass body, gold rim, two-tone cream swirl, rising bubbles
 *    Lid opens 12deg -> cream pops slightly -> lid closes, on a loop.
 * -------------------------------------------------------------------------- */
export function CreamJar({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf6ff" />
          <stop offset="100%" stopColor="#bfe3f7" />
        </linearGradient>
        <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f5c451" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
        <radialGradient id={`${uid}-cream`} cx="45%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-bodyClip`}>
          <rect x="45" y="82" width="110" height="86" rx="20" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="178" rx="52" ry="9" fill="#0f172a" opacity="0.16" filter={`url(#${uid}-shadow)`} />

      <rect x="45" y="82" width="110" height="86" rx="20" fill={`url(#${uid}-glass)`} stroke="#93c5fd" strokeOpacity="0.35" />
      <rect x="45" y="150" width="110" height="6" fill={`url(#${uid}-gold)`} opacity="0.85" />

      <motion.g
        style={{ transformOrigin: "100px 90px" }}
        animate={{ scaleY: [1, 1, 1.1, 1, 1], y: [0, 0, -3, 0, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.25, 0.45, 0.65, 1], ease: "easeInOut" }}
      >
        <path d="M68 88 Q100 62 132 88 Q116 100 100 84 Q84 100 68 88 Z" fill={`url(#${uid}-cream)`} />
        <path d="M84 86 Q100 74 116 86 Q108 92 100 84 Q92 92 84 86 Z" fill="#ffffff" opacity="0.7" />
      </motion.g>

      <motion.circle
        cx="120"
        cy="150"
        r="3"
        fill="#ffffff"
        opacity="0.5"
        animate={{ cy: [150, 100], opacity: [0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.circle
        cx="80"
        cy="155"
        r="2.2"
        fill="#ffffff"
        opacity="0.4"
        animate={{ cy: [155, 105], opacity: [0.5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeOut", delay: 1 }}
      />

      <g clipPath={`url(#${uid}-bodyClip)`}>
        <rect x="58" y="95" width="13" height="60" rx="6" fill="#ffffff" opacity="0.55" transform="rotate(8 58 95)" />
      </g>
      <ShineSweep clipId={`${uid}-bodyClip`} x0={-20} x1={200} duration={4} />

      <motion.g
        style={{ transformOrigin: "100px 78px" }}
        animate={{ rotate: [0, -12, -12, 0, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.2, 0.5, 0.7, 1], ease: "easeInOut" }}
      >
        <rect x="38" y="56" width="124" height="26" rx="13" fill={`url(#${uid}-lid)`} />
        <rect x="54" y="45" width="92" height="16" rx="8" fill="#1d4ed8" />
        <rect x="54" y="66" width="92" height="4" fill={`url(#${uid}-gold)`} opacity="0.9" />
        <circle cx="100" cy="53" r="3" fill="#ffffff" opacity="0.7" />
      </motion.g>
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 2) LOTION PUMP BOTTLE, breathing gradient body, dispensed droplet, shine
 * -------------------------------------------------------------------------- */
export function LotionPumpBottle({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-bottle`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c7f9ff" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <linearGradient id={`${uid}-pump`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <radialGradient id={`${uid}-breathe`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-bodyClip`}>
          <rect x="60" y="90" width="80" height="82" rx="18" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="178" rx="46" ry="8" fill="#0f172a" opacity="0.16" filter={`url(#${uid}-shadow)`} />

      <rect x="60" y="90" width="80" height="82" rx="18" fill={`url(#${uid}-bottle)`} stroke="#93c5fd" strokeOpacity="0.35" />
      <g clipPath={`url(#${uid}-bodyClip)`}>
        <motion.circle
          cx="100"
          cy="120"
          r="40"
          fill={`url(#${uid}-breathe)`}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.12, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>
      <rect x="70" y="118" width="60" height="30" rx="6" fill="#ffffff" opacity="0.55" />
      <line x1="78" y1="128" x2="122" y2="128" stroke="#1d4ed8" strokeWidth="2" opacity="0.6" />
      <line x1="78" y1="136" x2="108" y2="136" stroke="#1d4ed8" strokeWidth="2" opacity="0.4" />
      <rect x="68" y="98" width="10" height="66" rx="5" fill="#ffffff" opacity="0.45" />
      <ShineSweep clipId={`${uid}-bodyClip`} x0={40} x1={220} duration={3.6} delay={0.4} />

      <rect x="90" y="70" width="20" height="24" rx="4" fill={`url(#${uid}-pump)`} />

      <motion.path
        d="M100 38 Q106 48 100 54 Q94 48 100 38 Z"
        fill="#7dd3fc"
        animate={{ opacity: [0, 0, 1, 1, 0], y: [0, 0, 4, 14, 14] }}
        transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.42, 0.55, 0.8, 1], ease: "easeIn" }}
      />

      <motion.g
        style={{ transformOrigin: "100px 70px" }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <rect x="82" y="50" width="36" height="14" rx="7" fill={`url(#${uid}-pump)`} />
        <rect x="94" y="36" width="12" height="18" rx="5" fill="#0ea5e9" />
        <circle cx="100" cy="34" r="6" fill="#1d4ed8" />
      </motion.g>
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 3) MOISTURIZER TUBE, embossed emblem, twin droplets, shine sweep
 * -------------------------------------------------------------------------- */
export function MoisturizerTube({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-tube`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id={`${uid}-drop`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-tubeClip`}>
          <path d="M72 78 H128 L122 150 Q122 168 100 168 Q78 168 78 150 Z" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="178" rx="40" ry="8" fill="#0f172a" opacity="0.15" filter={`url(#${uid}-shadow)`} />

      <path
        d="M72 78 H128 L122 150 Q122 168 100 168 Q78 168 78 150 Z"
        fill={`url(#${uid}-tube)`}
        stroke="#60a5fa"
        strokeOpacity="0.35"
      />
      <circle cx="100" cy="120" r="16" fill="#ffffff" opacity="0.35" />
      <circle cx="100" cy="120" r="10" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2" />
      <rect x="78" y="58" width="44" height="24" rx="6" fill="#3b82f6" />
      <rect x="86" y="50" width="28" height="12" rx="4" fill="#2563eb" />
      <rect x="82" y="92" width="8" height="60" rx="4" fill="#ffffff" opacity="0.5" />
      <ShineSweep clipId={`${uid}-tubeClip`} x0={30} x1={210} duration={3.8} delay={0.2} />

      <motion.path
        d="M148 90 Q156 102 148 110 Q140 102 148 90 Z"
        fill={`url(#${uid}-drop)`}
        animate={{ y: [0, 26, 26], opacity: [1, 1, 0], scale: [0.9, 1.05, 0.8] }}
        transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.6, 1], ease: "easeIn" }}
      />
      <motion.path
        d="M56 100 Q62 110 56 116 Q50 110 56 100 Z"
        fill={`url(#${uid}-drop)`}
        animate={{ y: [0, 20, 20], opacity: [0, 1, 0], scale: [0.7, 0.9, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.6, 1], ease: "easeIn", delay: 1.1 }}
      />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 4) SUNSCREEN TUBE, sun rays rotate, shimmering wave base, UV badge
 * -------------------------------------------------------------------------- */
export function SunscreenTube({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-tube`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#fdba74" />
        </linearGradient>
        <radialGradient id={`${uid}-sun`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-tubeClip`}>
          <path d="M72 82 H128 L123 150 Q123 168 100 168 Q77 168 77 150 Z" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="178" rx="40" ry="8" fill="#0f172a" opacity="0.15" filter={`url(#${uid}-shadow)`} />

      <path
        d="M72 82 H128 L123 150 Q123 168 100 168 Q77 168 77 150 Z"
        fill={`url(#${uid}-tube)`}
        stroke="#fb923c"
        strokeOpacity="0.4"
      />
      <g clipPath={`url(#${uid}-tubeClip)`} opacity="0.4">
        <motion.path
          d="M75 150 Q90 145 105 150 T135 150"
          stroke="#ffffff"
          strokeWidth="3"
          fill="none"
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M75 160 Q90 155 105 160 T135 160"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          animate={{ x: [0, -6, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>
      <rect x="80" y="62" width="40" height="22" rx="6" fill="#f97316" />
      <rect x="88" y="54" width="24" height="12" rx="4" fill="#ea580c" />
      <text x="100" y="182" fontSize="9" fontWeight="700" fill="#9a3412" textAnchor="middle" opacity="0.7">
        SPF 50
      </text>

      <circle cx="130" cy="100" r="18" fill="#ffffff" opacity="0.85" stroke="#fb923c" strokeWidth="2" />
      <text x="130" y="105" fontSize="11" fontWeight="700" fill="#ea580c" textAnchor="middle">
        UV
      </text>

      <motion.g
        style={{ transformOrigin: "80px 130px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <line
              key={i}
              x1="80"
              y1="130"
              x2="80"
              y2="118"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle} 80 130)`}
            />
          );
        })}
      </motion.g>
      <circle cx="80" cy="130" r="10" fill={`url(#${uid}-sun)`} />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 5) SERUM DROPPER, measurement ticks, glass refraction lines, falling drop
 * -------------------------------------------------------------------------- */
export function SerumDropper({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0fdfa" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>
        <linearGradient id={`${uid}-serum`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-glassClip`}>
          <path d="M88 58 H112 L104 130 Q100 140 96 130 Z" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="178" rx="30" ry="7" fill="#0f172a" opacity="0.14" filter={`url(#${uid}-shadow)`} />

      <rect x="86" y="30" width="28" height="28" rx="10" fill="#134e4a" />
      <rect x="90" y="24" width="20" height="10" rx="5" fill="#0f766e" />

      <path
        d="M88 58 H112 L104 130 Q100 140 96 130 Z"
        fill={`url(#${uid}-glass)`}
        stroke="#2dd4bf"
        strokeOpacity="0.4"
      />
      <rect x="90" y="90" width="20" height="34" fill="#5eead4" opacity="0.35" />
      <g opacity="0.45">
        <line x1="90" y1="70" x2="96" y2="70" stroke="#0d9488" strokeWidth="1.5" />
        <line x1="90" y1="82" x2="97" y2="82" stroke="#0d9488" strokeWidth="1.5" />
        <line x1="90" y1="94" x2="98" y2="94" stroke="#0d9488" strokeWidth="1.5" />
        <line x1="91" y1="106" x2="99" y2="106" stroke="#0d9488" strokeWidth="1.5" />
      </g>
      <rect x="91" y="62" width="4" height="60" rx="2" fill="#ffffff" opacity="0.6" />
      <ShineSweep clipId={`${uid}-glassClip`} x0={70} x1={160} duration={3.2} delay={0.5} />

      <motion.circle
        cx="100"
        cy="140"
        r="5"
        fill={`url(#${uid}-serum)`}
        animate={{ cy: [140, 140, 168], r: [3, 6, 6], opacity: [0, 1, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.45, 1], ease: "easeIn" }}
      />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 6) ALCOHOL FREE BADGE, gold ring, twinkling sparkles, swinging droplet
 * -------------------------------------------------------------------------- */
export function AlcoholFreeBadge({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${uid}-badge`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dcfce7" />
        </radialGradient>
        <linearGradient id={`${uid}-drop`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id={`${uid}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="100" cy="176" rx="46" ry="8" fill="#0f172a" opacity="0.12" filter={`url(#${uid}-shadow)`} />

      <circle cx="100" cy="105" r="64" fill="none" stroke={`url(#${uid}-gold)`} strokeWidth="2.5" opacity="0.7" />
      <circle cx="100" cy="105" r="60" fill={`url(#${uid}-badge)`} stroke="#86efac" strokeOpacity="0.5" />

      <motion.g
        style={{ transformOrigin: "84px 76px" }}
        animate={{ rotate: [-6, 6, -6] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M84 76 C96 92 96 108 84 114 C72 108 72 92 84 76 Z" fill={`url(#${uid}-drop)`} />
        <circle cx="80" cy="98" r="3" fill="#ffffff" opacity="0.7" />
      </motion.g>

      <path d="M118 84 C138 82 146 100 132 116 C118 118 108 104 118 84 Z" fill={`url(#${uid}-leaf)`} />
      <path d="M120 88 Q128 100 130 112" stroke="#166534" strokeWidth="2" fill="none" opacity="0.6" />

      <text x="100" y="146" fontSize="20" fontWeight="800" fill="#166534" textAnchor="middle">
        0%
      </text>

    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 7) SKIN ANALYSIS, scanner frame, sweeping lens, animated skin data points
 * -------------------------------------------------------------------------- */
export function SkinAnalysisIcon({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-frame`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
        <linearGradient id={`${uid}-lens`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-frameClip`}>
          <rect x="46" y="56" width="108" height="100" rx="22" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="176" rx="48" ry="8" fill="#0f172a" opacity="0.13" filter={`url(#${uid}-shadow)`} />

      <rect x="46" y="56" width="108" height="100" rx="22" fill={`url(#${uid}-frame)`} stroke="#93c5fd" strokeOpacity="0.5" />

      <g clipPath={`url(#${uid}-frameClip)`} opacity="0.35">
        <line x1="70" y1="80" x2="130" y2="80" stroke="#3b82f6" strokeWidth="1.5" />
        <line x1="70" y1="100" x2="130" y2="100" stroke="#3b82f6" strokeWidth="1.5" />
        <line x1="70" y1="120" x2="130" y2="120" stroke="#3b82f6" strokeWidth="1.5" />
        <line x1="70" y1="140" x2="130" y2="140" stroke="#3b82f6" strokeWidth="1.5" />
      </g>

      {[
        [70, 88, 0],
        [128, 96, 0.5],
        [80, 132, 1],
        [122, 138, 1.5],
      ].map(([px, py, d], i) => (
        <motion.circle
          key={i}
          cx={px}
          cy={py}
          r="3.5"
          fill="#2563eb"
          animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.15, 0.7, 1], delay: d, ease: "easeInOut" }}
        />
      ))}

      <g clipPath={`url(#${uid}-frameClip)`}>
        <motion.rect
          x="46"
          y="56"
          width="14"
          height="100"
          fill="#60a5fa"
          opacity="0.25"
          animate={{ x: [46, 140, 46] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      <motion.g animate={{ x: [-18, 18, -18] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <circle cx="100" cy="100" r="22" fill={`url(#${uid}-lens)`} opacity="0.55" stroke="#2563eb" strokeWidth="3" />
        <line x1="116" y1="116" x2="132" y2="132" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
      </motion.g>

      <motion.path
        d="M88 100 L97 110 L114 90"
        stroke="#16a34a"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.75, 0.85, 0.95, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 8) COSMETIC SET, foundation, lipstick, powder compact + brush + sparkles
 * -------------------------------------------------------------------------- */
export function CosmeticSet({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-foundation`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
        <linearGradient id={`${uid}-lipstick`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id={`${uid}-compact`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="100" cy="180" rx="74" ry="8" fill="#0f172a" opacity="0.14" filter={`url(#${uid}-shadow)`} />

      <motion.g
        animate={{ rotate: [0, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "24px 168px" }}
      >
        <rect x="20" y="70" width="8" height="98" rx="4" fill="#78350f" />
        <path d="M14 58 Q24 40 34 58 Q30 74 24 76 Q18 74 14 58 Z" fill="#a8a29e" />
      </motion.g>

      <rect x="40" y="100" width="34" height="66" rx="10" fill={`url(#${uid}-foundation)`} stroke="#f59e0b" strokeOpacity="0.35" />
      <rect x="48" y="88" width="18" height="14" rx="4" fill="#d97706" />
      <rect x="44" y="108" width="6" height="48" rx="3" fill="#ffffff" opacity="0.5" />

      <g>
        <rect x="124" y="128" width="46" height="34" rx="8" fill={`url(#${uid}-compact)`} stroke="#a78bfa" strokeOpacity="0.4" />
        <rect x="124" y="158" width="46" height="4" fill={`url(#${uid}-gold)`} opacity="0.85" />
        <circle cx="147" cy="145" r="10" fill="#ffffff" opacity="0.6" />
        <motion.g
          style={{ transformOrigin: "124px 128px" }}
          animate={{ rotate: [0, -12, -12, 0, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.55, 0.75, 1], ease: "easeInOut" }}
        >
          <rect x="124" y="112" width="46" height="16" rx="8" fill="#ddd6fe" stroke="#a78bfa" strokeOpacity="0.5" />
          <circle cx="147" cy="120" r="3" fill="#ffffff" opacity="0.8" />
        </motion.g>
      </g>

      <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="92" y="118" width="20" height="48" rx="6" fill="#e5e7eb" stroke="#9ca3af" strokeOpacity="0.4" />
        <rect x="92" y="150" width="20" height="4" fill={`url(#${uid}-gold)`} opacity="0.8" />
        <path d="M94 118 L110 118 L106 96 Q100 88 96 96 Z" fill={`url(#${uid}-lipstick)`} />
      </motion.g>
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 9) FACE MIST / TONER SPRAY, nozzle presses, mist bursts outward in a cone
 * -------------------------------------------------------------------------- */
export function FaceMistBottle({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-bottle`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </linearGradient>
        <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-bodyClip`}>
          <rect x="72" y="86" width="56" height="86" rx="16" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="178" rx="38" ry="8" fill="#0f172a" opacity="0.15" filter={`url(#${uid}-shadow)`} />

      {/* cylindrical bottle body */}
      <rect x="72" y="86" width="56" height="86" rx="16" fill={`url(#${uid}-bottle)`} stroke="#818cf8" strokeOpacity="0.35" />
      <rect x="80" y="94" width="7" height="70" rx="3.5" fill="#ffffff" opacity="0.45" />
      <ShineSweep clipId={`${uid}-bodyClip`} x0={60} x1={200} duration={3.6} delay={0.3} />

      {/* nozzle + trigger, presses forward on a loop */}
      <rect x="86" y="66" width="28" height="22" rx="6" fill={`url(#${uid}-cap)`} />
      <motion.g
        style={{ transformOrigin: "100px 66px" }}
        animate={{ rotate: [0, -10, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <rect x="92" y="48" width="34" height="12" rx="6" fill="#6366f1" />
        <rect x="118" y="52" width="14" height="6" rx="3" fill="#4338ca" />
      </motion.g>

      {/* mist particles bursting outward in a cone, staggered */}
      {[
        [138, 40, 0],
        [148, 50, 0.15],
        [140, 58, 0.3],
        [152, 46, 0.45],
      ].map(([px, py, d], i) => (
        <motion.circle
          key={i}
          cx="128"
          cy="52"
          r="2.4"
          fill="#c7d2fe"
          animate={{ cx: [128, px], cy: [52, py], opacity: [0, 0.8, 0], scale: [0.4, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.6, delay: d, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 10) JADE ROLLER, rose-gold handle, spinning stone head
 * -------------------------------------------------------------------------- */
export function JadeRoller({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-handle`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#f0a8c4" />
        </linearGradient>
        <radialGradient id={`${uid}-stone`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="100%" stopColor="#34d399" />
        </radialGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="100" cy="178" rx="52" ry="8" fill="#0f172a" opacity="0.14" filter={`url(#${uid}-shadow)`} />

      {/* whole tool tilts gently as if rolling across skin */}
      <motion.g
        style={{ transformOrigin: "100px 140px" }}
        animate={{ rotate: [-4, 4, -4], x: [-4, 4, -4] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* handle */}
        <rect x="94" y="90" width="14" height="80" rx="7" fill={`url(#${uid}-handle)`} stroke="#f0a8c4" strokeOpacity="0.5" />
        <rect x="94" y="150" width="14" height="6" fill={`url(#${uid}-gold)`} opacity="0.85" />
        {/* fork connecting handle to roller stone */}
        <path d="M101 90 L60 62 M101 90 L142 62" stroke={`url(#${uid}-gold)`} strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* spinning jade stone (double roller head) */}
        <motion.g
          style={{ transformOrigin: "60px 58px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="60" cy="58" r="20" fill={`url(#${uid}-stone)`} stroke="#10b981" strokeOpacity="0.4" />
          <line x1="60" y1="40" x2="60" y2="76" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
          <line x1="46" y1="58" x2="74" y2="58" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "142px 58px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="142" cy="58" r="14" fill={`url(#${uid}-stone)`} stroke="#10b981" strokeOpacity="0.4" />
          <line x1="142" y1="45" x2="142" y2="71" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
        </motion.g>
      </motion.g>
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 11) PERFUME BOTTLE, faceted glass, gold cap twist, shimmer
 * -------------------------------------------------------------------------- */
export function PerfumeBottle({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef2f2" />
          <stop offset="100%" stopColor="#fecdd3" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f5c451" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-bodyClip`}>
          <path d="M64 96 L136 96 L128 168 Q100 178 72 168 Z" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="178" rx="48" ry="8" fill="#0f172a" opacity="0.15" filter={`url(#${uid}-shadow)`} />

      {/* faceted bottle silhouette */}
      <path d="M64 96 L136 96 L128 168 Q100 178 72 168 Z" fill={`url(#${uid}-glass)`} stroke="#fda4af" strokeOpacity="0.4" />
      {/* facet lines for a cut-glass look */}
      <g opacity="0.4">
        <line x1="84" y1="96" x2="80" y2="168" stroke="#ffffff" strokeWidth="2" />
        <line x1="100" y1="96" x2="100" y2="176" stroke="#ffffff" strokeWidth="2" />
        <line x1="116" y1="96" x2="120" y2="168" stroke="#ffffff" strokeWidth="2" />
      </g>
      <ShineSweep clipId={`${uid}-bodyClip`} x0={40} x1={220} duration={3.8} delay={0.5} />

      {/* neck */}
      <rect x="92" y="76" width="16" height="22" rx="3" fill="#fda4af" opacity="0.6" />

      {/* gold cap, twists slightly as if being opened/closed */}
      <motion.g
        style={{ transformOrigin: "100px 66px" }}
        animate={{ rotate: [0, 14, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="78" y="52" width="44" height="24" rx="8" fill={`url(#${uid}-gold)`} />
        <rect x="86" y="44" width="28" height="12" rx="4" fill="#b8860b" />
        <circle cx="100" cy="64" r="3" fill="#ffffff" opacity="0.6" />
      </motion.g>

      {/* fragrance shimmer rising above the cap */}
      <motion.path
        d="M100 40 Q104 32 100 24 Q96 32 100 40 Z"
        fill="#fecdd3"
        animate={{ opacity: [0, 0.7, 0], y: [0, -10, -18] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 12) LIP BALM STICK, twist-up cap, bullet rises then retracts
 * -------------------------------------------------------------------------- */
export function LipBalmStick({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-tube`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
        <linearGradient id={`${uid}-balm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-capClip`}>
          <rect x="82" y="60" width="36" height="66" rx="8" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="178" rx="30" ry="7" fill="#0f172a" opacity="0.13" filter={`url(#${uid}-shadow)`} />

      {/* base tube (static) */}
      <rect x="82" y="126" width="36" height="46" rx="8" fill={`url(#${uid}-tube)`} stroke="#facc15" strokeOpacity="0.4" />
      <line x1="82" y1="146" x2="118" y2="146" stroke="#eab308" strokeWidth="1.5" opacity="0.5" />

      {/* clear twist-up cap sleeve, clipping the rising balm bullet */}
      <g clipPath={`url(#${uid}-capClip)`}>
        <rect x="82" y="60" width="36" height="66" rx="8" fill="#ffffff" opacity="0.25" stroke="#facc15" strokeOpacity="0.3" />
        <motion.path
          d="M86 126 H114 L110 90 Q100 80 90 90 Z"
          fill={`url(#${uid}-balm)`}
          animate={{ y: [30, 0, 0, 30] }}
          transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
        />
      </g>
      <rect x="82" y="60" width="36" height="66" rx="8" fill="none" stroke="#facc15" strokeOpacity="0.5" />

    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 13) SHEET MASK PACKET, foil pouch, torn corner, gentle shimmer breathing
 * -------------------------------------------------------------------------- */
export function SheetMaskPacket({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-foil`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdf4ff" />
          <stop offset="100%" stopColor="#f0abfc" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${uid}-packetClip`}>
          <path d="M46 60 H154 V150 Q154 164 140 164 H60 Q46 164 46 150 Z" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="176" rx="54" ry="8" fill="#0f172a" opacity="0.13" filter={`url(#${uid}-shadow)`} />

      {/* pouch, breathes gently as if catching light */}
      <motion.g
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 112px" }}
      >
        <path
          d="M46 60 H154 V150 Q154 164 140 164 H60 Q46 164 46 150 Z"
          fill={`url(#${uid}-foil)`}
          stroke="#e879f9"
          strokeOpacity="0.4"
        />
        {/* heat-seal line near the top */}
        <line x1="46" y1="72" x2="154" y2="72" stroke="#d946ef" strokeWidth="2" opacity="0.35" strokeDasharray="4 3" />
        {/* torn notch corner */}
        <path d="M154 60 L142 60 L154 72 Z" fill="#fdf4ff" stroke="#e879f9" strokeOpacity="0.4" />

        {/* face silhouette print on the packet */}
        <path
          d="M100 90 Q118 90 118 112 Q118 132 100 138 Q82 132 82 112 Q82 90 100 90 Z"
          fill="none"
          stroke="#a21caf"
          strokeOpacity="0.45"
          strokeWidth="2"
        />
        <circle cx="92" cy="108" r="2" fill="#a21caf" opacity="0.4" />
        <circle cx="108" cy="108" r="2" fill="#a21caf" opacity="0.4" />
        <path d="M94 122 Q100 126 106 122" stroke="#a21caf" strokeOpacity="0.4" strokeWidth="2" fill="none" />

        <ShineSweep clipId={`${uid}-packetClip`} x0={20} x1={220} duration={4} delay={0.6} />
      </motion.g>

    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * 14) BEAUTY SPONGE, teardrop blender, gentle squish-and-bounce
 * -------------------------------------------------------------------------- */
export function BeautySponge({ className = DEFAULT_ICON_SIZE }) {
  const uid = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${uid}-sponge`} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="100%" stopColor="#fb7185" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <motion.ellipse
        cx="100"
        cy="178"
        rx="40"
        ry="8"
        fill="#0f172a"
        opacity="0.16"
        filter={`url(#${uid}-shadow)`}
        animate={{ scaleX: [1, 1.12, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* teardrop sponge body, squishes down and rebounds like it's being pressed */}
      <motion.g
        style={{ transformOrigin: "100px 168px" }}
        animate={{ scaleY: [1, 0.86, 1], scaleX: [1, 1.08, 1], y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M100 56 C132 90 140 128 118 154 C108 166 92 166 82 154 C60 128 68 90 100 56 Z"
          fill={`url(#${uid}-sponge)`}
          stroke="#f43f5e"
          strokeOpacity="0.3"
        />
        {/* pore texture dots */}
        <g opacity="0.25">
          <circle cx="90" cy="110" r="2" fill="#ffffff" />
          <circle cx="106" cy="120" r="2" fill="#ffffff" />
          <circle cx="96" cy="134" r="1.6" fill="#ffffff" />
          <circle cx="112" cy="100" r="1.6" fill="#ffffff" />
        </g>
        {/* highlight */}
        <ellipse cx="90" cy="90" rx="8" ry="14" fill="#ffffff" opacity="0.45" transform="rotate(-15 90 90)" />
      </motion.g>

    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * FLOATING COSMETIC DECORATION
 * High-detail vector icon wrapper with scroll-driven parallax motion, ultra-smooth
 * floating loops, customizable size, and luminous multi-layered ambient glow.
 * -------------------------------------------------------------------------- */
export function FloatingCosmeticDecoration({
  Icon,
  size = "w-56 h-56",
  className = "",
  yRange = [0, -30, 0],
  rotateRange = [-4, 4, -4],
  duration = 5.5,
  delay = 0,
  accent = "#93c5fd",
  showGlow = true,
  parallaxOffset = 50,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [-parallaxOffset, parallaxOffset]);
  const smoothParallaxY = useSpring(rawY, { stiffness: 60, damping: 18 });

  if (!Icon) return null;

  return (
    <div ref={ref} className={`pointer-events-none absolute z-0 select-none ${className}`}>
      <motion.div style={{ y: smoothParallaxY }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.65, filter: "blur(14px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{
              y: yRange,
              rotate: rotateRange,
              scale: [1, 1.03, 1, 1.02, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
            className="relative flex items-center justify-center"
          >
            {showGlow && accent && (
              <div
                className="absolute inset-0 m-auto -z-10 rounded-full blur-3xl opacity-50"
                style={{
                  background: `radial-gradient(circle, ${accent}88, transparent 70%)`,
                  transform: "scale(1.4)",
                }}
              />
            )}
            <Icon className={`${size} drop-shadow-2xl transition-transform duration-300`} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * COSMETIC CARD
 * A single premium icon composition: ambient glow, independent icon floating
 * layer, and entrance + hover interactions. No background box, just the
 * illustration, its light, and its motion.
 * -------------------------------------------------------------------------- */
export function CosmeticCard({ Icon, label, accent = "#93c5fd", delay = 0, className = "" }) {
  return (
    <motion.div
      className={`relative flex flex-col items-center justify-center ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={cardRevealVariants}
      transition={{ delay }}
      whileHover="hover"
      style={{ willChange: "transform" }}
    >
      {/* ambient glow behind the icon only, breathes and expands on hover.
          inset-0 + m-auto centers a fixed-size absolute box regardless of
          the parent's layout; rounded-full keeps it a soft circle, never
          a flat rectangle. */}
      <motion.div
        className="absolute inset-0 m-auto -z-10 w-[240px] h-[240px] rounded-full"
        variants={glowVariants}
        initial="rest"
        style={{
          background: `radial-gradient(circle, ${accent}55, transparent 70%)`,
          filter: "blur(24px)",
        }}
      />

      {/* icon floats independently from the entrance/hover motion */}
      <motion.div variants={idleFloat} animate="animate" className={DEFAULT_ICON_SIZE}>
        <Icon className="w-full h-full drop-shadow-sm" />
      </motion.div>

      {label && (
        <p className="mt-3 text-center text-sm font-semibold tracking-wide text-slate-700">
          {label}
        </p>
      )}
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
 * DEFAULT EXPORT: COSMETIC DECORATION
 * A ready-to-drop-in grid/cluster of all 14 illustrated products, each with
 * its own staggered entrance delay so the reveal cascades like a premium
 * product showcase instead of popping in all at once.
 * -------------------------------------------------------------------------- */
export default function CosmeticDecoration({ className = "" }) {
  const items = [
    { Icon: CreamJar, label: "Cream Jar", accent: "#93c5fd" },
    { Icon: LotionPumpBottle, label: "Lotion", accent: "#0ea5e9" },
    { Icon: MoisturizerTube, label: "Moisturizer", accent: "#3b82f6" },
    { Icon: SunscreenTube, label: "Sunscreen", accent: "#f59e0b" },
    { Icon: SerumDropper, label: "Serum", accent: "#14b8a6" },
    { Icon: AlcoholFreeBadge, label: "Alcohol Free", accent: "#22c55e" },
    { Icon: SkinAnalysisIcon, label: "Skin Analysis", accent: "#3b82f6" },
    { Icon: CosmeticSet, label: "Cosmetic Set", accent: "#eab308" },
    { Icon: FaceMistBottle, label: "Face Mist", accent: "#6366f1" },
    { Icon: JadeRoller, label: "Jade Roller", accent: "#34d399" },
    { Icon: PerfumeBottle, label: "Perfume", accent: "#fb7185" },
    { Icon: LipBalmStick, label: "Lip Balm", accent: "#facc15" },
    { Icon: SheetMaskPacket, label: "Sheet Mask", accent: "#d946ef" },
    { Icon: BeautySponge, label: "Beauty Sponge", accent: "#fb7185" },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-12 ${className}`}>
      {items.map((item, i) => (
        <CosmeticCard
          key={item.label}
          Icon={item.Icon}
          label={item.label}
          accent={item.accent}
          delay={i * 0.06}
        />
      ))}
    </div>
  );
}
