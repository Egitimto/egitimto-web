'use server'

import { createClient } from '@/lib/supabase/server'

const MAX_LENGTHS = {
  fullName: 200,
  email: 254,
  subject: 200,
  message: 5000,
}

export async function submitContactForm(
  _prevState: { success: boolean; error?: string },
  formData: FormData
) {
  // Honeypot: a real visitor never sees or fills this field; bots that
  // auto-fill every input in the form do.
  if (String(formData.get('website') ?? '').trim() !== '') {
    return { success: true }
  }

  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const subject = String(formData.get('subject') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!fullName || !email || !subject || !message) {
    return { success: false, error: 'Lütfen tüm zorunlu alanları doldurun.' }
  }

  if (
    fullName.length > MAX_LENGTHS.fullName ||
    email.length > MAX_LENGTHS.email ||
    subject.length > MAX_LENGTHS.subject ||
    message.length > MAX_LENGTHS.message
  ) {
    return { success: false, error: 'Girdiğiniz bilgiler çok uzun, lütfen kısaltın.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').insert({
    full_name: fullName,
    email,
    subject,
    message,
  })

  if (error) {
    if (error.code === '42501') {
      return {
        success: false,
        error: 'Kısa süre içinde çok fazla mesaj gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin.',
      }
    }
    return { success: false, error: 'Mesajınız gönderilemedi, lütfen tekrar deneyin.' }
  }

  return { success: true }
}
