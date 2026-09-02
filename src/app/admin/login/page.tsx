import { signIn } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <form
        action={signIn}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 p-8"
      >
        <h1 className="font-display text-2xl font-bold text-dark">Yönetim Paneli Girişi</h1>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            E-posta veya şifre hatalı.
          </p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-body-text">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-body-text">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="gradient-primary w-full rounded-full px-4 py-2 font-semibold text-white"
        >
          Giriş Yap
        </button>
      </form>
    </main>
  )
}
