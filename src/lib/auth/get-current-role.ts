import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/supabase/types'

export async function getCurrentRole(): Promise<Role | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase.rpc('current_user_role')
  return (data as Role) ?? null
}
