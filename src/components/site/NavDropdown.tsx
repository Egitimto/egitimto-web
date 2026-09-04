'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

export function NavDropdown({
  label,
  items,
}: {
  label: string
  items: { href: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-base font-medium text-white/90 hover:text-white"
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full z-10 min-w-48 rounded-xl border border-neutral-200 bg-white p-2 pt-3 shadow-lg"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-body-text hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
