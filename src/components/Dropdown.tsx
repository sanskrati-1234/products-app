import { useState, useEffect, useRef } from 'react'

function ChevronDown() {
  return (
    <svg className="w-4 h-4 shrink-0 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

export interface DropdownOption<T extends string = string> {
  value: T
  label: string
}

interface CustomDropdownProps<T extends string> {
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  placeholder: string
  leftIcon?: React.ReactNode
  triggerClassName?: string
}

export function CustomDropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  leftIcon,
  triggerClassName = 'min-w-[180px]',
}: CustomDropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)
  const displayLabel = selected ? selected.label : placeholder

  return (
    <div ref={ref} className={`relative ${triggerClassName}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 pl-3 pr-2.5 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-200 hover:border-gray-300 transition-colors min-h-[42px]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={displayLabel}
      >
        <span className="flex items-center gap-2 truncate">
          {leftIcon && <span className="text-gray-500 shrink-0">{leftIcon}</span>}
          <span className="truncate">{displayLabel}</span>
        </span>
        <ChevronDown />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 rounded-lg bg-gray-200 shadow-lg py-1.5 min-w-full overflow-hidden border border-gray-200"
          role="listbox"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-300 transition-colors"
              >
                <span className="w-5 flex justify-center">{isSelected ? <CheckIcon /> : null}</span>
                <span className="flex-1">{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
