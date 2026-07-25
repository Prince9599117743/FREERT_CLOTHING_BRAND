import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/brevo';
import { otpEmailTemplate } from '@/lib/email-templates';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, name, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: 'email and purpose are required.' }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Delete any old OTPs for this email+purpose
    await supabaseAdmin
      .from('support_tickets')
      .delete()
      .eq('email', email)
      .eq('status', `otp_${purpose}`);

    // Store OTP in support_tickets table (reusing existing table, no schema change)
    const { error: insertError } = await supabaseAdmin.from('support_tickets').insert({
      name: name || 'FREERT User',
      email,
      subject: `OTP_${purpose.toUpperCase()}:${otp}:${expiresAt}`,
      message: JSON.stringify({ otp, expiresAt, purpose }),
      status: `otp_${purpose}`
    });

    if (insertError) {
      console.error('[SendOTP] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to store OTP.' }, { status: 500 });
    }

    // Send OTP email via Brevo
    const html = otpEmailTemplate(otp, purpose as 'signup' | 'reset_password', name);
    const emailSubject = purpose === 'signup'
      ? 'Your FREERT Verification Code'
      : 'FREERT Password Reset Code';

    const result = await sendTransactionalEmail({
      to: [{ email, name: name || 'FREERT Customer' }],
      subject: emailSubject,
      htmlContent: html
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' });

  } catch (err: any) {
    console.error('[SendOTP] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
