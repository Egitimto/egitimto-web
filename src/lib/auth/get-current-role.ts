import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/supabase/types'

export async function getCurrentRole(): Promise<Role | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase.rpc('current_user_role')
  if (error) {
    console.error('getCurrentRole: current_user_role RPC failed', error)
    return null
  }
  return (data as Role) ?? null
}
