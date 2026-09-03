import type { Database } from './database.types'

export type Locale = 'tr' | 'en'

export type Role = 'admin' | 'moderator'

export interface UserRole {
  user_id: string
  role: Role
  created_at: string
}

export interface SocialLinks {
  instagram?: string
  linkedin?: string
  twitter?: string
  email?: string
}

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Document = Tables<'documents'>
export type AboutContent = Tables<'about_content'>
export type TeamCategory = Tables<'team_categories'>
export type Partnership = Tables<'partnerships'>
export type NewsItem = Tables<'news'>
export type EventItem = Tables<'events'>

export type TeamMember = Omit<Tables<'team_members'>, 'social_links'> & { social_links: SocialLinks }

export type ContactMessage = Tables<'contact_messages'>
