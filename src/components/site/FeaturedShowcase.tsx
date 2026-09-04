'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { Highlighter } from '@/components/ui/highlighter'
import { ShineBorder } from '@/components/ui/shine-border'
import { localize } from '@/lib/i18n/localize'
import type { Locale } from '@/lib/supabase/types'

const AUTO_ADVANCE_MS = 10000

export interface FeaturedItem {
  id: string
  type: 'haber' | 'etkinlik'
  title_tr: string
  title_en: string
  cover_image: string | null
  slug: string
  featured_at: string | null
}

function hashString(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return Math.abs(hash) || 1
}

function pickIndices(count: number, wordCount: number, seed: number, exclude: Set<number>): number[] {
  const indices: number[] = []
  let s = seed
  let guard = 0
  while (indices.length < count && guard < 50) {
    s = (s * 9301 + 49297) % 233280
    const idx = Math.floor((s / 233280) * wordCount)
    if (!indices.includes(idx) && !exclude.has(idx)) indices.push(idx)
    guard++
  }
  return indices
}

/** Deterministically marks a couple of words per title as underlined/highlighted, so the
 * same title always renders the same way (avoids SSR/CSR hydration mismatch from real randomness). */
function markTitleWords(title: string) {
  const words = title.split(' ')
  const seed = hashString(title)
  const underlineCount = words.length <= 3 ? 1 : 2
  const highlightCount = words.length <= 1 ? 0 : words.length <= 4 ? 1 : 2

  const underline = new Set(pickIndices(underlineCount, words.length, seed, new Set()))
  const highlight = new Set(pickIndices(highlightCount, words.length, seed + 17, underline))

  return { words, underline, highlight }
}

export function FeaturedShowcase({ items, locale }: { items: FeaturedItem[]; locale: Locale }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => {
      setDirection(1)
      setIndex((i) => (i + 1) % items.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(id)
  }, [items.length, index])

  if (items.length === 0) return null

  const item = items[index % items.length]
  const href = item.type === 'haber' ? `/haberler/${item.slug}` : `/etkinlikler/${item.slug}`
  const goPrev = () => {
    setDirection(-1)
    setIndex((i) => (i - 1 + items.length) % items.length)
  }
  const goNext = () => {
    setDirection(1)
    setIndex((i) => (i + 1) % items.length)
  }
  const title = localize(item.title_tr, item.title_en, locale)
  const { words, underline, highlight } = markTitleWords(title)

  return (
    <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={item.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="group relative mx-auto w-full max-w-md"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-primary-light/50 blur-[90px] transition-all duration-700 group-hover:scale-125 group-hover:bg-primary-light/70" />
          <div className="relative aspect-square overflow-hidden rounded-[2rem] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
            {item.cover_image ? (
              <Image
                src={item.cover_image}
                alt=""
                fill
                sizes="(min-width: 768px) 400px, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-neutral-200" />
            )}
            <ShineBorder shineColor={['#FF6B35', '#FF8C42', '#E85A2A']} borderWidth={2} />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex h-full flex-col justify-between gap-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="font-display text-3xl leading-tight font-bold text-dark sm:text-4xl lg:text-5xl"
          >
            {words.map((word, i) => (
              <span key={`${item.id}-${i}`}>
                {underline.has(i) ? (
                  <Highlighter action="underline" color="#FF8C42" padding={2}>
                    {word}
                  </Highlighter>
                ) : highlight.has(i) ? (
                  <Highlighter action="highlight" color="#FFD9B8" padding={2}>
                    {word}
                  </Highlighter>
                ) : (
                  word
                )}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-3 self-start md:self-end">
          <button
            type="button"
            onClick={goPrev}
            aria-label={localize('Önceki', 'Previous', locale)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link
            href={href}
            className="gradient-primary rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
          >
            {localize('Detayları Gör', 'View Details', locale)}
          </Link>
          <button
            type="button"
            onClick={goNext}
            aria-label={localize('Sonraki', 'Next', locale)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
