'use client'

import Image from 'next/image'
import { useRef, useState, type ElementType } from 'react'
import { Eye, HeartHandshake, Leaf, Lightbulb, Scale, Sparkles, Users } from 'lucide-react'

import { AnimatedBeam } from '@/components/ui/animated-beam'

const ICON_BY_TITLE: Record<string, ElementType> = {
  'fırsat eşitliği': Scale,
  şeffaflık: Eye,
  gönüllülük: HeartHandshake,
  yenilikçilik: Lightbulb,
  katılımcılık: Users,
  sürdürülebilirlik: Leaf,
}

function iconFor(title: string): ElementType {
  return ICON_BY_TITLE[title.trim().toLowerCase()] ?? Sparkles
}

interface ValueItem {
  title: string
  description: string
}

function parseValues(text: string): ValueItem[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split(':')
      return { title: title.trim(), description: rest.join(':').trim() }
    })
}

function IconNode({
  nodeRef,
  Icon,
  active,
  label,
  onClick,
  style,
}: {
  nodeRef: React.RefObject<HTMLButtonElement | null>
  Icon: ElementType
  active: boolean
  label: string
  onClick: () => void
  style: React.CSSProperties
}) {
  return (
    <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={style}>
      <button
        ref={nodeRef}
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300 hover:scale-105 ${
          active
            ? 'border-primary bg-primary text-white shadow-md scale-110'
            : 'border-primary/40 bg-white text-primary hover:border-primary'
        }`}
      >
        <Icon className="h-7 w-7" />
      </button>
      <span
        className={`absolute top-full left-1/2 mt-2 w-28 -translate-x-1/2 text-center text-sm leading-tight font-bold ${
          active ? 'text-primary' : 'text-dark'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export function ValuesBeamDiagram({ valuesTr, valuesEn, locale }: { valuesTr: string; valuesEn: string; locale: 'tr' | 'en' }) {
  const itemsTr = parseValues(valuesTr)
  const itemsEn = parseValues(valuesEn)
  const items = itemsTr.map((item, i) => ({
    tr: item,
    en: itemsEn[i] ?? item,
  }))

  const [selected, setSelected] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = [
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
  ]

  if (items.length === 0) return null

  const selectedItem = items[selected] ?? items[0]
  const selectedText = locale === 'en' ? selectedItem.en : selectedItem.tr
  const visibleItems = items.slice(0, 6)

  return (
    <div>
      {/* Desktop: beam diagram on the left, description panel on the right */}
      <div className="hidden md:grid md:grid-cols-2 md:items-center md:gap-10">
        <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-[420px] py-8">
          {visibleItems.map((item, index) => (
            <AnimatedBeam
              key={item.tr.title}
              containerRef={containerRef}
              fromRef={nodeRefs[index]}
              toRef={centerRef}
              curvature={0}
              duration={4}
              delay={index * 0.15}
              pathColor="#FF6B35"
              pathWidth={2}
              pathOpacity={selected === index ? 0.6 : 0.25}
            />
          ))}

          <div
            ref={centerRef}
            className="absolute top-1/2 left-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md"
          >
            <Image src="/images/kurumlogo.png" alt="" width={68} height={68} className="object-contain" />
          </div>

          {visibleItems.map((item, index) => {
            const angle = (index / visibleItems.length) * 2 * Math.PI - Math.PI / 2
            const radius = 36
            const left = 50 + radius * Math.cos(angle)
            const top = 50 + radius * Math.sin(angle)
            return (
              <IconNode
                key={item.tr.title}
                nodeRef={nodeRefs[index]}
                Icon={iconFor(item.tr.title)}
                active={selected === index}
                label={locale === 'en' ? item.en.title : item.tr.title}
                onClick={() => setSelected(index)}
                style={{ left: `${left}%`, top: `${top}%` }}
              />
            )
          })}
        </div>

        <div className="min-h-[180px] rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
          <p className="font-display text-2xl font-bold text-dark">{selectedText.title}</p>
          <p className="mt-3 text-base leading-relaxed text-body-text">{selectedText.description}</p>
        </div>
      </div>

      {/* Mobile: accessible accordion fallback */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((item) => {
          const text = locale === 'en' ? item.en : item.tr
          const Icon = iconFor(item.tr.title)
          return (
            <details key={item.tr.title} className="rounded-xl border border-neutral-200 p-4">
              <summary className="flex cursor-pointer items-center gap-3 font-semibold text-dark">
                <Icon className="text-primary h-5 w-5 shrink-0" />
                {text.title}
              </summary>
              <p className="mt-2 text-sm text-body-text">{text.description}</p>
            </details>
          )
        })}
      </div>
    </div>
  )
}
