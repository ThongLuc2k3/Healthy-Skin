export function SectionSeam() {
  return (
    <div className="relative h-px w-full overflow-hidden my-4">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#60a5fa]/35 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563eb]/20 blur-xs" />
    </div>
  )
}

