import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined;
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define protected zones
  const isAdminPath = path.startsWith('/admin') || path.startsWith('/api/admin');
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/checkout') || isAdminPath;

  // Bypass auth checks if database configurations are not present (Local Demo Mode)
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  // Retrieve auth token from cookies (supabase default auth cookies)
  const sessionToken = request.cookies.get('sb-access-token')?.value || '';

  if (isProtectedPath && !sessionToken) {
    // Redirect to login if unauthenticated
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // Admin access validation
  if (isAdminPath && sessionToken) {
    try {
      // Validate role on Supabase
      const { data: { user } } = await supabase.auth.getUser(sessionToken);
      const userRole = user?.app_metadata?.role || 'customer';
      
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/dashboard/:path*',
    '/checkout/:path*',
  ]
};
