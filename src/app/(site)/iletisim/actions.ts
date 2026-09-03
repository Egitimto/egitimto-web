'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitContactForm(
  _prevState: { success: boolean; error?: string },
  formData: FormData
) {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const subject = String(formData.get('subject') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!fullName || !email || !subject || !message) {
    return { success: false, error: 'Lütfen tüm zorunlu alanları doldurun.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').insert({
    full_name: fullName,
    email,
    subject,
    message,
  })

  if (error) {
    return { success: false, error: 'Mesajınız gönderilemedi, lütfen tekrar deneyin.' }
  }

  return { success: true }
}
