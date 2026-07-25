import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, otp, purpose } = await request.json();

    if (!email || !otp || !purpose) {
      return NextResponse.json({ valid: false, reason: 'missing_fields' }, { status: 400 });
    }

    // Find the OTP record
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('email', email)
      .eq('status', `otp_${purpose}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ valid: false, reason: 'not_found' });
    }

    const record = data[0];
    let stored: { otp: string; expiresAt: string; purpose: string };

    try {
      stored = JSON.parse(record.message);
    } catch {
      return NextResponse.json({ valid: false, reason: 'corrupt_record' });
    }

    // Check expiry
    if (new Date() > new Date(stored.expiresAt)) {
      await supabaseAdmin.from('support_tickets').delete().eq('id', record.id);
      return NextResponse.json({ valid: false, reason: 'expired' });
    }

    // Check OTP value
    if (stored.otp !== otp.toString()) {
      return NextResponse.json({ valid: false, reason: 'invalid' });
    }

    // Clean up used OTP
    await supabaseAdmin.from('support_tickets').delete().eq('id', record.id);

    // For password reset: issue a short-lived server-side reset token
    if (purpose === 'reset_password') {
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await supabaseAdmin.from('support_tickets').insert({
        name: 'Password Reset Verified',
        email,
        subject: `RESET_TOKEN:${resetToken}`,
        message: JSON.stringify({ resetToken, email, verifiedAt: new Date().toISOString() }),
        status: 'otp_reset_verified'
      });
      return NextResponse.json({ valid: true, resetToken });
    }

    return NextResponse.json({ valid: true });

  } catch (err: any) {
    console.error('[VerifyOTP] Error:', err.message);
    return NextResponse.json({ valid: false, reason: 'server_error' }, { status: 500 });
  }
}
