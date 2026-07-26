import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .ilike('email', email.trim())
      .not('status', 'eq', 'live_session')
      .not('subject', 'ilike', 'OTP_VERIFICATION:%')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    console.error('API User Support Tickets Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve support tickets', details: error.message },
      { status: 500 }
    );
  }
}
