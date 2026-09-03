'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'

export async function upsertPartnership(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const descriptionTr = String(formData.get('project_description_tr') ?? '')
  const descriptionEn = String(formData.get('project_description_en') ?? '')
  const sortOrder = Number(formData.get('sort_order') ?? 0)

  if (!name) {
    redirect(`/admin/isbirlikleri/${id || 'new'}?error=${encodeURIComponent('İsim zorunludur.')}`)
  }

  const supabase = await createClient()

  const logoFile = formData.get('logo_url') as File | null
  const uploadedLogo = logoFile ? await uploadToStorage(supabase, 'partnership-logos', logoFile) : null
  const existingLogo = String(formData.get('existing_logo_url') ?? '') || null
  const logoUrl = uploadedLogo ?? existingLogo

  if (!logoUrl) {
    redirect(`/admin/isbirlikleri/${id || 'new'}?error=${encodeURIComponent('Logo zorunludur.')}`)
  }

  const payload = {
    name,
    project_description_tr: descriptionTr,
    project_description_en: descriptionEn,
    sort_order: sortOrder,
    logo_url: logoUrl,
  }

  const query = id
    ? supabase.from('partnerships').update(payload).eq('id', id)
    : supabase.from('partnerships').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/isbirlikleri/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/isbirlikleri')
  revalidatePath('/isbirlikleri')
  redirect('/admin/isbirlikleri')
}

export async function deletePartnership(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('partnerships').delete().eq('id', id)
  revalidatePath('/admin/isbirlikleri')
  revalidatePath('/isbirlikleri')
}
