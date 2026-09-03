export function PublishToggle({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-body-text">
      <input type="checkbox" name="is_published" defaultChecked={defaultChecked} />
      Yayınla
    </label>
  )
}
