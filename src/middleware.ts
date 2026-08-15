import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that are always accessible regardless of operational mode
const ALWAYS_ALLOWED = [
  '/maintenance',
  '/api/', // Next.js API routes and proxy
  '/_next/', // Next.js static assets
  '/favicon',
  '/icons/',
  '/manifest',
  '/monitoring', // Sentry tunnel
];

/**
 * Next.js edge middleware that enforces operational mode on every page request.
 * Fetches the backend's public /system/status endpoint and redirects to /maintenance
 * if the platform is not in NORMAL mode.
 *
 * This runs BEFORE React renders — so users can never bypass it by navigating directly.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and always-allowed routes
  if (ALWAYS_ALLOWED.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // --- Affiliate Referral Interceptor ---
  const refParam = request.nextUrl.searchParams.get('ref');
  let response = NextResponse.next();

  if (refParam) {
    // Clone the URL and remove the 'ref' parameter to keep the address bar clean
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete('ref');

    // Redirect to the clean URL
    response = NextResponse.redirect(redirectUrl);

    // Set the affiliate cookie (expires in 30 days)
    response.cookies.set({
      name: 'skilvi_affiliate_ref',
      value: refParam,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Accessible by frontend if needed
      sameSite: 'lax',
    });

    // If we redirect here, we skip the maintenance check for this single request,
    // but the subsequent redirected request will run through the middleware again.
    return response;
  }
  // -------------------------------------

  try {
    // Call the backend's public status endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const isProd = process.env.NODE_ENV === 'production';
    
    // If NEXT_PUBLIC_API_URL is relative (e.g. /api/v1), we need an absolute URL for Edge fetch
    let backendUrl = 'http://localhost:5050';
    if (apiUrl.startsWith('http')) {
      backendUrl = apiUrl.replace('/api/v1', '');
    } else if (isProd) {
      backendUrl = 'http://courseservermain-env.eba-6svqvpng.ap-south-1.elasticbeanstalk.com';
    }

    const statusRes = await fetch(`${backendUrl}/api/v1/system/status`, {
      next: { revalidate: 10 }, // Cache for 10 seconds to avoid hammering the endpoint
      signal: AbortSignal.timeout(2000), // 2 second timeout — fail open if backend is down
    });

    if (statusRes.ok) {
      const status = await statusRes.json();
      const mode: string = status?.mode || 'NORMAL';

      if (mode === 'NORMAL') {
        return NextResponse.next();
      }

      const roleCookie = request.cookies.get('skilvi_role')?.value;

      if (mode === 'MAINTENANCE' || mode === 'READ_ONLY') {
        // Admins and superadmins bypass maintenance completely
        if (roleCookie === 'admin' || roleCookie === 'superadmin') {
          return NextResponse.next();
        }

        // For non-admins, redirect ALL pages to maintenance.
        const reason = status?.reason || 'Platform is under maintenance.';
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        url.searchParams.set('message', reason);
        url.searchParams.set('mode', mode);
        return NextResponse.redirect(url);
      }

      if (mode === 'EMERGENCY_LOCKDOWN') {
        // Superadmins bypass emergency lockdown completely
        if (roleCookie === 'superadmin') {
          return NextResponse.next();
        }

        // During lockdown, block EVERYTHING
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        url.searchParams.set(
          'message',
          'Platform is under emergency lockdown. All access is restricted.',
        );
        url.searchParams.set('mode', mode);
        return NextResponse.redirect(url);
      }
    }
  } catch {
    // If status check fails (backend down, timeout), fail open — let the request through.
    // The individual API calls will still return 503 and the client interceptor will redirect.
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest|sw.js|workbox).*)',
  ],
};
