import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
         process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== undefined;
};

// Fast JWT decoder for edge middleware
function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Decode base64url payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define routes scope
  const isAdminPath = path.startsWith('/admin') || path.startsWith('/api/admin');
  const isCustomerOnlyPath = path.startsWith('/dashboard') || path.startsWith('/checkout');
  const isProtectedPath = isCustomerOnlyPath || isAdminPath;

  // If Supabase credentials are not set (local offline development)
  if (!isSupabaseConfigured()) {
    // If running in production mode, block access with error
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse(
        `<html>
          <head><title>System Maintenance</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="background:#0a0a0a; color:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; padding:20px; text-align:center;">
            <h2 style="font-weight:300; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px; font-size:16px;">System Maintenance</h2>
            <p style="color:#888; font-size:12px; max-width:320px; font-weight:300; line-height:1.6; margin-bottom:20px;">We are currently updating our database clusters. Secure connections will resume shortly.</p>
            <div style="width:20px; height:20px; border:1px solid #333; border-top:1px solid #fff; border-radius:50%; animation:spin 1s linear infinite;"></div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          </body>
        </html>`,
        { status: 503, headers: { 'Content-Type': 'text/html' } }
      );
    }
    return NextResponse.next();
  }

  // Retrieve auth token from cookies
  const sessionToken = request.cookies.get('sb-access-token')?.value || '';

  if (isProtectedPath && !sessionToken) {
    // Redirect to login if unauthenticated
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionToken) {
    const jwt = decodeJwt(sessionToken);
    if (!jwt) {
      // Clear invalid cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('sb-access-token');
      return response;
    }

    const userRole = jwt.app_metadata?.role || 'customer';

    // 1. Admin path restrictions: only admin or superadmin allowed
    if (isAdminPath) {
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        // Customers redirect back to storefront home page
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // 2. Customer path restrictions: admins are redirected to admin panel
    if (isCustomerOnlyPath) {
      if (userRole === 'admin' || userRole === 'superadmin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
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
