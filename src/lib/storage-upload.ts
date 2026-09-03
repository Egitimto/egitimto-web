import type { createClient } from './supabase/server'
import { slugify } from './slugify'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf('.')
  const base = lastDot > 0 ? name.slice(0, lastDot) : name
  const ext = lastDot > 0 ? name.slice(lastDot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : ''
  const safeBase = slugify(base) || 'dosya'
  return ext ? `${safeBase}.${ext}` : safeBase
}

export async function uploadToStorage(
  supabase: SupabaseServerClient,
  bucket: string,
  file: File
): Promise<string | null> {
  if (!file || file.size === 0) return null

  const path = `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) return null

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
