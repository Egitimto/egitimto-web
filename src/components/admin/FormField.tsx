export function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-body-text">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
