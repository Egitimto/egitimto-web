'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'

export async function createCategory(formData: FormData) {
  const nameTr = String(formData.get('name_tr') ?? '').trim()
  const nameEn = String(formData.get('name_en') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0)

  if (!nameTr || !nameEn) {
    redirect(`/admin/ekibimiz?error=${encodeURIComponent('Kategori adları zorunludur.')}`)
  }

  const supabase = await createClient()
  await supabase.from('team_categories').insert({ name_tr: nameTr, name_en: nameEn, sort_order: sortOrder })
  revalidatePath('/admin/ekibimiz')
  revalidatePath('/ekibimiz')
  redirect('/admin/ekibimiz')
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('team_categories').delete().eq('id', id)
  revalidatePath('/admin/ekibimiz')
  revalidatePath('/ekibimiz')
}

export async function upsertMember(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const categoryId = String(formData.get('category_id') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()
  const roleTr = String(formData.get('role_tr') ?? '').trim()
  const roleEn = String(formData.get('role_en') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim() || null
  const sortOrder = Number(formData.get('sort_order') ?? 0)
  const instagram = String(formData.get('instagram') ?? '').trim()
  const linkedin = String(formData.get('linkedin') ?? '').trim()
  const twitter = String(formData.get('twitter') ?? '').trim()

  if (!categoryId || !fullName || !roleTr || !roleEn) {
    redirect(`/admin/ekibimiz/uye/${id || 'new'}?error=${encodeURIComponent('Zorunlu alanları doldurun.')}`)
  }

  const supabase = await createClient()

  const photoFile = formData.get('photo_url') as File | null
  const uploadedPhoto = photoFile ? await uploadToStorage(supabase, 'team-photos', photoFile) : null
  const existingPhoto = String(formData.get('existing_photo_url') ?? '') || null
  const photoUrl = uploadedPhoto ?? existingPhoto

  const socialLinks: Record<string, string> = {}
  if (instagram) socialLinks.instagram = instagram
  if (linkedin) socialLinks.linkedin = linkedin
  if (twitter) socialLinks.twitter = twitter
  if (email) socialLinks.email = email

  const payload = {
    category_id: categoryId,
    full_name: fullName,
    role_tr: roleTr,
    role_en: roleEn,
    email,
    photo_url: photoUrl,
    sort_order: sortOrder,
    social_links: socialLinks,
  }

  const query = id
    ? supabase.from('team_members').update(payload).eq('id', id)
    : supabase.from('team_members').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/ekibimiz/uye/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/ekibimiz')
  revalidatePath('/ekibimiz')
  redirect('/admin/ekibimiz')
}

export async function deleteMember(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('team_members').delete().eq('id', id)
  revalidatePath('/admin/ekibimiz')
  revalidatePath('/ekibimiz')
}
