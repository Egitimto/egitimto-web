'use client'

export function DeleteButton({
  action,
  children,
  label = 'Sil',
}: {
  action: (formData: FormData) => void | Promise<void>
  children?: React.ReactNode
  label?: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
          e.preventDefault()
        }
      }}
      className="inline"
    >
      {children}
      <button type="submit" className="text-sm text-red-600 hover:underline">
        {label}
      </button>
    </form>
  )
}
