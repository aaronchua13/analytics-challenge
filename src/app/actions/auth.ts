'use server';

import { createClient } from '@/lib/supabase-server';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type AuthResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function signInAction(data: z.infer<typeof signInSchema>): Promise<AuthResponse> {
  const result = signInSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: 'Invalid input' };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signUpAction(data: z.infer<typeof signUpSchema>): Promise<AuthResponse> {
  const result = signUpSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: 'Invalid input' };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  // For sign up, we might need a redirect URL for email confirmation if enabled
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Check your email to confirm your account.' };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
