'use client'

export function FeaturedToggleButton({
  action,
  isFeatured,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>
  isFeatured: boolean
  children?: React.ReactNode
}) {
  return (
    <form action={action} className="inline">
      {children}
      <input type="hidden" name="is_featured" value={String(isFeatured)} />
      <button type="submit" className="text-sm text-primary hover:underline">
        {isFeatured ? 'Öne Çıkanlardan Kaldır' : 'Öne Çıkar'}
      </button>
    </form>
  )
}
