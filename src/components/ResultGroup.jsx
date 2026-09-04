import { motion } from 'framer-motion'
import ResultAccordionItem from './ResultAccordionItem'

const THEME = {
  green: {
    wrap: 'border-[#dbeafe] bg-[#FCFDFC]',
    badge: 'bg-[#6F9D8D]/15 text-[#2563eb] border border-[#6F9D8D]/30',
    accent: '#6F9D8D',
  },
  yellow: {
    wrap: 'border-[#dbeafe] bg-[#FCFDFC]',
    badge: 'bg-[#D8B27A]/15 text-[#A87A45] border border-[#D8B27A]/30',
    accent: '#D8B27A',
  },
  red: {
    wrap: 'border-[#dbeafe] bg-[#FCFDFC]',
    badge: 'bg-rose-500/15 text-rose-700 border border-rose-400/30',
    accent: '#EF4444',
  },
}

function ResultGroup({ title, resultValue, color, icon, items }) {
  const theme = THEME[color] || THEME.green

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
      className={`rounded-[28px] border p-6 sm:p-8 shadow-[0_10px_35px_rgba(47, 169, 140,0.04)] ${theme.wrap}`}
    >
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#dbeafe]">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.badge}`}>
            {icon}
          </span>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#172554]">{title}</h3>
            <p className="text-xs text-[#64748B]">Phân tích dựa trên thuật toán match_engine AI</p>
          </div>
        </div>

        <span className={`rounded-full px-3.5 py-1 text-xs font-extrabold ${theme.badge}`}>
          {items.length} mục
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#BFD8CF] bg-[#eff6ff] p-8 text-center">
          <p className="text-sm font-medium text-[#64748B]">Không có thành phần hoặc thực phẩm nào thuộc nhóm này.</p>
        </div>
      ) : (
        <ul className="space-y-3.5 p-0 m-0">
          {items.map((item) => (
            <ResultAccordionItem key={item.id} item={item} result={resultValue} />
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default ResultGroup
