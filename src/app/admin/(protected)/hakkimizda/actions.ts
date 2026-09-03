'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'

export async function updateAboutContent(formData: FormData) {
  const supabase = await createClient()

  const tuzukFile = formData.get('tuzuk_pdf_url') as File | null
  const uploadedTuzuk = tuzukFile ? await uploadToStorage(supabase, 'document-files', tuzukFile) : null
  const existingTuzuk = String(formData.get('existing_tuzuk_pdf_url') ?? '') || null
  const tuzukPdfUrl = uploadedTuzuk ?? existingTuzuk

  const payload = {
    kurulus_tr: String(formData.get('kurulus_tr') ?? ''),
    kurulus_en: String(formData.get('kurulus_en') ?? ''),
    amac_ilkeler_tr: String(formData.get('amac_ilkeler_tr') ?? ''),
    amac_ilkeler_en: String(formData.get('amac_ilkeler_en') ?? ''),
    vizyon_tr: String(formData.get('vizyon_tr') ?? ''),
    vizyon_en: String(formData.get('vizyon_en') ?? ''),
    degerler_tr: String(formData.get('degerler_tr') ?? ''),
    degerler_en: String(formData.get('degerler_en') ?? ''),
    tuzuk_pdf_url: tuzukPdfUrl,
  }

  const { error } = await supabase.from('about_content').update(payload).eq('id', 1)

  if (error) {
    redirect(`/admin/hakkimizda?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/hakkimizda')
  revalidatePath('/hakkimizda')
  redirect('/admin/hakkimizda?success=1')
}
