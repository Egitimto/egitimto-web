'use client'

import { useState } from 'react'
import Link from 'next/link'

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
        className="text-sm font-medium text-body-text hover:text-primary"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 min-w-48 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-body-text hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
