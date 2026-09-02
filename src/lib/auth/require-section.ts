import { redirect } from 'next/navigation'
import { getCurrentRole } from './get-current-role'
import { canAccessSection, type AdminSection } from './roles'

export async function requireSection(section: AdminSection) {
  const role = await getCurrentRole()
  if (!canAccessSection(role, section)) {
    redirect('/admin')
  }
  return role
}
