'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

interface NavItem {
  href: string
  label: string
}

export function MobileNav({
  egitimtoLabel,
  egitimtoItems,
  duyurularLabel,
  duyurularItems,
  simpleItems,
}: {
  egitimtoLabel: string
  egitimtoItems: NavItem[]
  duyurularLabel: string
  duyurularItems: NavItem[]
  simpleItems: NavItem[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:text-white"
      >
        {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-label="Mobil menü"
            className="absolute top-full left-0 z-20 w-full overflow-hidden bg-white shadow-lg"
          >
            <div className="flex flex-col divide-y divide-neutral-100 px-6 py-2">
              <div className="py-2">
                <p className="py-1 text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                  {egitimtoLabel}
                </p>
                {egitimtoItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-body-text hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="py-2">
                <p className="py-1 text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                  {duyurularLabel}
                </p>
                {duyurularItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-body-text hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="py-2">
                {simpleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 font-medium text-dark hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
