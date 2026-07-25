import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, verifiedToken, newPassword } = await request.json();

    if (!email || !verifiedToken || !newPassword) {
      return NextResponse.json({ error: 'email, verifiedToken, and newPassword are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // The verifiedToken is a temporary reset token stored in support_tickets after OTP verify step
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('email', email)
      .eq('status', 'otp_reset_verified')
      .eq('subject', `RESET_TOKEN:${verifiedToken}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (tokenError || !tokenRecord || tokenRecord.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset session. Please start over.' }, { status: 400 });
    }

    // Check token is not older than 15 minutes
    const tokenAge = Date.now() - new Date(tokenRecord[0].created_at).getTime();
    if (tokenAge > 15 * 60 * 1000) {
      await supabaseAdmin.from('support_tickets').delete().eq('id', tokenRecord[0].id);
      return NextResponse.json({ error: 'Reset session expired. Please start over.' }, { status: 400 });
    }

    // Find user by email
    const { data: userList, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError || !userList) {
      return NextResponse.json({ error: 'Failed to find user account.' }, { status: 500 });
    }

    const user = userList.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
    }

    // Update password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Clean up token record
    await supabaseAdmin.from('support_tickets').delete().eq('id', tokenRecord[0].id);

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });

  } catch (err: any) {
    console.error('[ResetPasswordOTP] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
