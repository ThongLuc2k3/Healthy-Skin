import { motion } from 'framer-motion'

function CheckboxGroup({ name, options, values, onChange }) {
  function toggle(id) {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id))
    } else {
      onChange([...values, id])
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const checked = values.includes(option.id)
        return (
          <motion.label
            key={option.id}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${
              checked
                ? 'border-[#2563eb] bg-gradient-to-r from-[#60a5fa]/12 via-[#60a5fa]/8 to-[#2563eb]/6 text-[#172554] shadow-[0_8px_20px_rgba(47, 169, 140,0.12)] ring-1 ring-[#2563eb]/40'
                : 'border-[#E9EEF1] bg-[#FDFDFB] text-[#172554] shadow-[0_2px_8px_rgba(14, 59, 51,0.03)] hover:border-[#60a5fa]/60 hover:bg-white hover:shadow-[0_6px_16px_rgba(14, 59, 51,0.06)]'
            }`}
          >
            <input
              type="checkbox"
              name={name}
              value={option.id}
              checked={checked}
              onChange={() => toggle(option.id)}
              className="sr-only"
            />
            <span className="text-base font-semibold tracking-tight text-[#172554]">
              {option.label}
            </span>
            <span
              className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all duration-300 ${
                checked
                  ? 'border-[#2563eb] bg-[#2563eb] shadow-[0_0_8px_rgba(112, 196, 175,0.5)]'
                  : 'border-[#BFD8CF] bg-transparent'
              }`}
            >
              {checked && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="h-2 w-2 rounded-xs bg-[#FDFDFB]"
                />
              )}
            </span>
          </motion.label>
        )
      })}
    </div>
  )
}

export default CheckboxGroup
