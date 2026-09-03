import type { createClient } from './supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function uploadToStorage(
  supabase: SupabaseServerClient,
  bucket: string,
  file: File
): Promise<string | null> {
  if (!file || file.size === 0) return null

  const path = `${crypto.randomUUID()}-${file.name}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) return null

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
