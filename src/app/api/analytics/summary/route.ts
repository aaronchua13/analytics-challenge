import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  const supabase = await createClient()

  // Validate session via Authorization header
  const authHeader = (await headers()).get('Authorization')
  const token = authHeader?.split(' ')[1]
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use database function to get aggregated stats
  // Note: We need to use a client that can call the RPC. 
  // Since we have the user ID, we can call the RPC securely.
  // The RPC is defined as SECURITY DEFINER, so it bypasses RLS, but we pass user.id to filter.
  // Ideally, we should use the authenticated client to call it, but RPC calls with supabase-js
  // use the auth token. Here 'supabase' client is created with cookies, but we verified token manually.
  // To make RPC work with the correct user context if it relied on auth.uid(), we'd need to set session.
  // But our RPC takes p_user_id as argument, so we can just call it.

  const { data, error } = await supabase
    .rpc('get_dashboard_summary', { p_user_id: user.id })

  if (error) {
    console.error('RPC Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
