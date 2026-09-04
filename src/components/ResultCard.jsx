import { CheckCircleIcon, WarningIcon } from './Icons'
import { RESULT } from '../logic/matchEngine'
import ExplainButton from './ExplainButton'

const THEME = {
  [RESULT.SUITABLE]: {
    wrap: 'border-emerald-500/30 glass text-[#183B3B] shadow-glow',
    badge: 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/40',
    icon: CheckCircleIcon,
  },
  [RESULT.CAUTION]: {
    wrap: 'border-amber-500/30 glass text-[#183B3B] shadow-glow',
    badge: 'bg-amber-500/20 text-amber-800 border border-amber-500/40',
    icon: WarningIcon,
  },
}

function ResultCard({ item, result, reason }) {
  const theme = THEME[result]
  const Icon = theme.icon

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${theme.wrap}`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.badge}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.badge}`}>
          {result}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold text-[#183B3B]">{item.name_vi}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#183B3B] opacity-90">{reason}</p>
      <ExplainButton nameVi={item.name_vi} category={item.category} result={result} reason={reason} />
    </div>
  )
}

export default ResultCard
