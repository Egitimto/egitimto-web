export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="font-display text-3xl font-bold text-dark">{title}</h2>
      {subtitle && <p className="mt-2 text-body-text">{subtitle}</p>}
    </div>
  )
}
