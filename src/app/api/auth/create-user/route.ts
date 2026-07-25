import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Admin client — allows creating confirmed users without email confirmation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'email, password, and fullName are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Check if user already exists in auth.users
    const { data: existingList } = await supabaseAdmin.auth.admin.listUsers();
    const alreadyExists = existingList?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase());
    if (alreadyExists) {
      return NextResponse.json({ error: 'An account already exists with this email. Please sign in.' }, { status: 409 });
    }

    // Create user with Admin API — email_confirm: true skips Supabase's own confirmation email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Mark email as pre-verified (we verified via our OTP)
      user_metadata: {
        full_name: fullName,
        phone: phone || ''
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'User creation failed.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      message: 'Account created and email verified successfully.'
    });

  } catch (err: any) {
    console.error('[CreateUser] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
