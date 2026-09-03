'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Highlighter } from '@/components/ui/highlighter'
import { ShineBorder } from '@/components/ui/shine-border'
import { localize } from '@/lib/i18n/localize'
import type { Locale } from '@/lib/supabase/types'

export interface FeaturedItem {
  id: string
  type: 'haber' | 'etkinlik'
  title_tr: string
  title_en: string
  cover_image: string | null
  slug: string
  featured_at: string | null
}

export function FeaturedShowcase({ items, locale }: { items: FeaturedItem[]; locale: Locale }) {
  const [index, setIndex] = useState(0)
  if (items.length === 0) return null

  const item = items[index % items.length]
  const href = item.type === 'haber' ? `/haberler/${item.slug}` : `/etkinlikler/${item.slug}`
  const goPrev = () => setIndex((i) => (i - 1 + items.length) % items.length)
  const goNext = () => setIndex((i) => (i + 1) % items.length)

  return (
    <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
      <div className="group relative mx-auto w-full max-w-md">
        <div className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-primary-light/50 blur-[90px] transition-all duration-700 group-hover:scale-125 group-hover:bg-primary-light/70" />
        <div className="relative aspect-square overflow-hidden rounded-[2rem] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
          {item.cover_image ? (
            <Image
              key={item.id}
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
      </div>

      <div className="flex h-full flex-col justify-between gap-10">
        <p className="font-display text-3xl leading-tight font-bold text-dark sm:text-4xl lg:text-5xl">
          <Highlighter key={item.id} action="highlight" color="#FF8C42">
            {localize(item.title_tr, item.title_en, locale)}
          </Highlighter>
        </p>

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
