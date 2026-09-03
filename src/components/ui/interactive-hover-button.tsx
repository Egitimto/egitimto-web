import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

type CommonProps = {
  children: React.ReactNode
  className?: string
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

type AnchorProps = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export function InteractiveHoverButton({ children, className, href, ...props }: ButtonProps | AnchorProps) {
  const classes = cn(
    'group bg-white relative inline-flex w-auto min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-neutral-300 p-3 px-10 text-center font-semibold align-middle',
    className
  )

  const content = (
    <>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-primary h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]" />
        <span className="inline-block whitespace-nowrap transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 whitespace-nowrap text-white opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </>
  )

  if (href) {
    return (
      <a href={href} className={classes} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    )
  }

  return (
    <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  )
}
