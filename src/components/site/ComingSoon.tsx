export function ComingSoon({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-dark">{title}</h1>
      <p className="mt-4 text-body-text">{message}</p>
    </div>
  )
}
