import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { APPS } from '@/content/apps'

const BASE_URL = 'https://www.egitimto.org'

const STATIC_ROUTES = [
  '',
  '/hakkimizda',
  '/alanlarimiz',
  '/ekibimiz',
  '/haberler',
  '/etkinlikler',
  '/projeler',
  '/isbirlikleri',
  '/uygulamalarimiz',
  '/destek-ol',
  '/iletisim',
  '/yasal/tuzuk',
  '/yasal/kvkk',
  '/yasal/etik-ilkeler',
  '/yasal/sss',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: news }, { data: events }] = await Promise.all([
    supabase.from('news').select('slug, published_at').eq('is_published', true),
    supabase.from('events').select('slug, published_at').eq('is_published', true),
  ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
  }))

  const newsEntries: MetadataRoute.Sitemap = (news ?? []).map((item) => ({
    url: `${BASE_URL}/haberler/${item.slug}`,
    lastModified: item.published_at ?? undefined,
  }))

  const eventEntries: MetadataRoute.Sitemap = (events ?? []).map((item) => ({
    url: `${BASE_URL}/etkinlikler/${item.slug}`,
    lastModified: item.published_at ?? undefined,
  }))

  const appEntries: MetadataRoute.Sitemap = APPS.map((app) => ({
    url: `${BASE_URL}/uygulamalarimiz/${app.slug}`,
  }))

  return [...staticEntries, ...newsEntries, ...eventEntries, ...appEntries]
}
