import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use standard supabase-js because edge functions might have different cookie handling
// or just standard client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const runtime = 'edge'

export async function GET(request: Request) {
  // Validate auth via header token because cookies might be harder in Edge
  // Or just use the token passed in Authorization header
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || 'monthly'

  // Fetch metrics using RPC
  const { data, error } = await supabase
    .rpc('get_engagement_metrics', { 
      p_user_id: user.id,
      p_time_range: range 
    })

  if (error) {
    console.error('RPC Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
