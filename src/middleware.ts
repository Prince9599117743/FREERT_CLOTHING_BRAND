import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define protected dashboard and api zones
  const isAdminPath = path.startsWith('/admin') || path.startsWith('/api/admin');
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/checkout') || isAdminPath;

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
      
      // In production, we query user details or check custom JWT claims
      const userRole = user?.app_metadata?.role || 'customer';
      
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        // Forbidden redirect
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify matching route paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/dashboard/:path*',
    '/checkout/:path*',
  ]
};
