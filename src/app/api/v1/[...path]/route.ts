import { NextRequest, NextResponse } from 'next/server';

// App Router catch-all proxy: /api/v1/[...path] → Elastic Beanstalk backend
// Using a Serverless Function (not Edge) so cookies and HTTP (non-HTTPS) backends work reliably.

const BACKEND_BASE = process.env.NODE_ENV === 'production'
  ? 'http://courseservermain-env.eba-6svqvpng.ap-south-1.elasticbeanstalk.com/api/v1'
  : 'http://localhost:5050/api/v1';

async function shadowProxy(req: NextRequest) {
  const url = new URL(req.url);
  // Strip /api/v1 prefix from the path since BACKEND_BASE already includes it
  const path = url.pathname.replace(/^\/api\/v1/, '');
  const targetUrl = `${BACKEND_BASE}${path}${url.search}`;

  // Forward all headers, but sanitize problematic ones
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Skip headers that cause issues when proxying
    const skip = ['host', 'connection', 'content-length', 'transfer-encoding'];
    if (!skip.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Explicitly forward cookies so HttpOnly refresh tokens reach the backend
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }

  // Forward the real client IP for rate limiting / audit logging
  const realIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (realIp) {
    headers.set('x-forwarded-for', realIp);
  }

  let body: ArrayBuffer | undefined = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 0) body = buf;
    } catch (e) {
      console.warn('[Proxy] Failed to read request body:', e);
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    const res = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward response headers (skip content-encoding — Next.js handles it)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.headers.set(key, value);
      }
    });

    return res;
  } catch (error: any) {
    console.error(`[Proxy] Failed to reach backend at ${targetUrl}:`, error.message);
    return NextResponse.json(
      { message: 'Proxy Error: Could not connect to backend.', error: error.message },
      { status: 502 }
    );
  }
}

export const GET = shadowProxy;
export const POST = shadowProxy;
export const PUT = shadowProxy;
export const PATCH = shadowProxy;
export const DELETE = shadowProxy;
export const OPTIONS = shadowProxy;

// Force Node.js runtime — required for HTTP backends and cookie forwarding
export const runtime = 'nodejs';
