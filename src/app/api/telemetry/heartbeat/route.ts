import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a server-side Supabase client using the SERVICE_ROLE_KEY to bypass RLS policies
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { sessionId, customerName, customerEmail } = payload;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Prune old telemetry sessions older than 2 minutes to keep database storage footprint minimal
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from('support_tickets')
        .delete()
        .eq('status', 'live_session')
        .lt('created_at', twoMinutesAgo);
    } catch (pruneErr: any) {
      console.warn('[Telemetry] Pruning error:', pruneErr.message);
    }

    const { data, error } = await supabaseAdmin.from('support_tickets').insert({
      name: customerName || 'Guest Shopper',
      email: customerEmail || 'Guest',
      subject: `LIVE_SESSION_HEARTBEAT:${sessionId}`,
      message: JSON.stringify(payload),
      status: 'live_session'
    }).select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('Telemetry Heartbeat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to write telemetry data', details: error.message },
      { status: 500 }
    );
  }
}
