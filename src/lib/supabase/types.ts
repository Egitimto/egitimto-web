export type Locale = 'tr' | 'en'

export type Role = 'admin' | 'moderator'

export interface UserRole {
  user_id: string
  role: Role
  created_at: string
}

export interface Document {
  id: string
  type: 'beyanname' | 'faaliyet_raporu'
  title: string
  year: number
  pdf_url: string
  sort_order: number
  created_at: string
}

export interface AboutContent {
  id: number
  tuzuk_pdf_url: string | null
  amac_ilkeler_tr: string
  amac_ilkeler_en: string
  updated_at: string
}

export interface TeamCategory {
  id: string
  name_tr: string
  name_en: string
  sort_order: number
}

export interface SocialLinks {
  instagram?: string
  linkedin?: string
  twitter?: string
  email?: string
}

export interface TeamMember {
  id: string
  category_id: string
  full_name: string
  role_tr: string
  role_en: string
  photo_url: string | null
  email: string | null
  social_links: SocialLinks
  sort_order: number
}

export interface Partnership {
  id: string
  name: string
  project_description_tr: string
  project_description_en: string
  logo_url: string
  sort_order: number
}

export interface NewsItem {
  id: string
  slug: string
  title_tr: string
  title_en: string
  content_tr: string
  content_en: string
  cover_image: string | null
  published_at: string | null
  show_apply_button: boolean
  apply_button_url: string | null
  is_published: boolean
  created_at: string
}

export interface EventItem extends NewsItem {
  event_date: string | null
  location: string | null
}
