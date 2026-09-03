import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  name: string
  className?: string
  background?: ReactNode
  description?: string
  href: string
  cta: string
}

const BENTO_SPAN_PATTERN = [
  'col-span-1 row-span-2 sm:col-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1 sm:col-span-2',
  'col-span-1 row-span-1',
]

export function bentoSpanClass(index: number): string {
  return BENTO_SPAN_PATTERN[index % BENTO_SPAN_PATTERN.length]
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => (
  <div
    className={cn('grid w-full auto-rows-[14rem] grid-cols-1 grid-flow-dense gap-4 sm:grid-cols-3', className)}
    {...props}
  >
    {children}
  </div>
)

const BentoCard = ({ name, className, background, description, href, cta }: BentoCardProps) => (
  <Link
    href={href}
    className={cn(
      'group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm transition-shadow hover:shadow-md',
      className
    )}
  >
    {background && <div className="absolute inset-0">{background}</div>}
    <div className="relative z-10 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-4 pt-12">
      <h3 className="font-display font-bold text-white">{name}</h3>
      {description && <p className="mt-1 line-clamp-2 text-sm text-white/80">{description}</p>}
      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </span>
    </div>
  </Link>
)

export { BentoGrid, BentoCard }
