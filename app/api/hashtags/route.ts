import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  if (q.length < 2) {
    return NextResponse.json({ hashtags: [] })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hashtags_index')
    .select('label, count')
    .ilike('label', `%${q}%`)
    .order('count', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ hashtags: [] }, { status: 500 })
  }

  return NextResponse.json({ hashtags: data ?? [] })
}
