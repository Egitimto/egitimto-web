'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'

export async function upsertDocument(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const type = String(formData.get('type') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const year = Number(formData.get('year') ?? 0)
  const sortOrder = Number(formData.get('sort_order') ?? 0)

  if (!title || (type !== 'beyanname' && type !== 'faaliyet_raporu') || !year) {
    redirect(`/admin/belgeler/${id || 'new'}?error=${encodeURIComponent('Tüm zorunlu alanları doldurun.')}`)
  }

  const supabase = await createClient()

  const pdfFile = formData.get('pdf_url') as File | null
  const uploadedPdf = pdfFile ? await uploadToStorage(supabase, 'document-files', pdfFile) : null
  const existingPdf = String(formData.get('existing_pdf_url') ?? '') || null
  const pdfUrl = uploadedPdf ?? existingPdf

  if (!pdfUrl) {
    redirect(`/admin/belgeler/${id || 'new'}?error=${encodeURIComponent('PDF dosyası zorunludur.')}`)
  }

  const payload = { type, title, year, sort_order: sortOrder, pdf_url: pdfUrl }

  const query = id
    ? supabase.from('documents').update(payload).eq('id', id)
    : supabase.from('documents').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/belgeler/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/belgeler')
  revalidatePath('/hakkimizda')
  redirect('/admin/belgeler')
}

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('documents').delete().eq('id', id)
  revalidatePath('/admin/belgeler')
  revalidatePath('/hakkimizda')
}
