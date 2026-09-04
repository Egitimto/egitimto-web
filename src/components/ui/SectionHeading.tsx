export function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  if (align === 'left') {
    return (
      <div className="mb-10 text-left">
        <h2 className="font-display -ml-2 text-4xl font-bold text-dark sm:-ml-3 sm:text-5xl">{title}</h2>
        {subtitle && <p className="mt-2 text-body-text">{subtitle}</p>}
      </div>
    )
  }

  return (
    <div className="mb-10 text-center">
      <h2 className="font-display text-3xl font-bold text-dark">{title}</h2>
      {subtitle && <p className="mt-2 text-body-text">{subtitle}</p>}
    </div>
  )
}
