export function EmptyState({ message }: { message: string }) {
  return (
    <div className="gradient-cream rounded-2xl px-6 py-16 text-center">
      <p className="text-body-text">{message}</p>
    </div>
  )
}
