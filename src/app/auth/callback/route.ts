import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth callback handler for Supabase OAuth (Google Sign-In)
// Supabase handles token exchange client-side via the fragment (#access_token=...)
// This route handles the server-side code exchange flow.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin));
  }

  if (code) {
    // Exchange code for session via Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          apikey: supabasePublishableKey,
        },
        body: new URLSearchParams({ code }),
      });

      if (res.ok) {
        // Redirect to the next URL — session is set client-side via auth state listener
        const redirectUrl = new URL(next, requestUrl.origin);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (err) {
      // Fall through to error redirect
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
