import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SignUpForm from './signup-form'

export default async function SignUpPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <SignUpForm />
}
