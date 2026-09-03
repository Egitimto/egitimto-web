'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'
import { slugify } from '@/lib/slugify'

export async function upsertNews(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const titleTr = String(formData.get('title_tr') ?? '').trim()
  const titleEn = String(formData.get('title_en') ?? '').trim()
  const contentTr = String(formData.get('content_tr') ?? '')
  const contentEn = String(formData.get('content_en') ?? '')
  let slug = String(formData.get('slug') ?? '').trim()
  const isPublished = formData.get('is_published') === 'on'
  const showApplyButton = formData.get('show_apply_button') === 'on'
  const applyButtonUrl = String(formData.get('apply_button_url') ?? '').trim() || null

  if (!titleTr || !titleEn) {
    redirect(`/admin/haberler/${id || 'new'}?error=${encodeURIComponent('Başlık alanları zorunludur.')}`)
  }

  if (!slug) slug = slugify(titleTr)

  const supabase = await createClient()

  const coverFile = formData.get('cover_image') as File | null
  const uploadedCover = coverFile ? await uploadToStorage(supabase, 'news-events-covers', coverFile) : null
  const existingCover = String(formData.get('existing_cover_image') ?? '') || null
  const coverImage = uploadedCover ?? existingCover

  const payload = {
    title_tr: titleTr,
    title_en: titleEn,
    content_tr: contentTr,
    content_en: contentEn,
    slug,
    is_published: isPublished,
    show_apply_button: showApplyButton,
    apply_button_url: showApplyButton ? applyButtonUrl : null,
    cover_image: coverImage,
  }

  const query = id
    ? supabase.from('news').update(payload).eq('id', id)
    : supabase.from('news').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/haberler/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/haberler')
  revalidatePath('/haberler')
  redirect('/admin/haberler')
}

export async function deleteNews(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('news').delete().eq('id', id)
  revalidatePath('/admin/haberler')
  revalidatePath('/haberler')
}
