export default function LogoIcon({ className = "h-9 w-9" }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Ring Gradient: Champagne Gold to Sage Teal */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4c5a9" />
          <stop offset="50%" stopColor="#7bbdb3" />
          <stop offset="100%" stopColor="#2e5b53" />
        </linearGradient>

        {/* Leaf Gradient */}
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a3d8d0" />
          <stop offset="50%" stopColor="#5fa89b" />
          <stop offset="100%" stopColor="#1e3d37" />
        </linearGradient>

        {/* Drop Gradient */}
        <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5ebd9" />
          <stop offset="100%" stopColor="#7bbdb3" />
        </linearGradient>
      </defs>

      {/* Outer Ring */}
      <circle
        cx="100"
        cy="100"
        r="90"
        stroke="url(#ringGrad)"
        strokeWidth="7"
        strokeDasharray="520"
        strokeDashoffset="20"
      />

      {/* Water Drop at Top */}
      <path
        d="M 100 20 C 100 20 88 40 88 50 C 88 57 93.3 62 100 62 C 106.7 62 112 57 112 50 C 112 40 100 20 100 20 Z"
        fill="url(#dropGrad)"
        stroke="#d4c5a9"
        strokeWidth="2"
      />

      {/* Botanical Leaf on Left */}
      <path
        d="M 92 170 C 45 155 30 110 35 75 C 65 70 100 95 92 170 Z"
        fill="url(#leafGrad)"
        stroke="#a3d8d0"
        strokeWidth="2.5"
      />
      {/* Leaf Veins */}
      <path d="M 45 135 Q 65 125 90 120" stroke="#f5ebd9" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <path d="M 42 110 Q 60 102 85 100" stroke="#f5ebd9" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <path d="M 46 88 Q 62 82 80 82" stroke="#f5ebd9" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

      {/* Face Silhouette & Neural Network Nodes on Right */}
      <path
        d="M 105 170 Q 130 165 145 150 Q 155 138 152 125 Q 162 118 155 105 Q 148 98 145 90 Q 150 78 135 65"
        stroke="#5fa89b"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Synaptic Lines */}
      <line x1="110" y1="80" x2="132" y2="72" stroke="#7bbdb3" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="132" y1="72" x2="152" y2="85" stroke="#7bbdb3" strokeWidth="2" />
      <line x1="115" y1="105" x2="135" y2="98" stroke="#7bbdb3" strokeWidth="2" />
      <line x1="135" y1="98" x2="155" y2="108" stroke="#7bbdb3" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="120" y1="135" x2="142" y2="128" stroke="#7bbdb3" strokeWidth="2" />
      <line x1="142" y1="128" x2="148" y2="150" stroke="#7bbdb3" strokeWidth="2" />
      <line x1="132" y1="72" x2="135" y2="98" stroke="#7bbdb3" strokeWidth="2" />
      <line x1="135" y1="98" x2="142" y2="128" stroke="#7bbdb3" strokeWidth="2" />

      {/* Neural Nodes (Circles) */}
      <circle cx="110" cy="80" r="5" fill="#7bbdb3" />
      <circle cx="132" cy="72" r="6" fill="#a3d8d0" />
      <circle cx="152" cy="85" r="7" fill="#5fa89b" />
      <circle cx="115" cy="105" r="4" fill="#a3d8d0" />
      <circle cx="135" cy="98" r="6" fill="#5fa89b" />
      <circle cx="155" cy="108" r="7" fill="#7bbdb3" />
      <circle cx="120" cy="135" r="5" fill="#5fa89b" />
      <circle cx="142" cy="128" r="6.5" fill="#2e5b53" />
      <circle cx="148" cy="150" r="5.5" fill="#7bbdb3" />
    </svg>
  )
}
