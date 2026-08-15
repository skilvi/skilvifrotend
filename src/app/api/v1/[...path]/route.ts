import { NextRequest, NextResponse } from 'next/server';

// This catch-all proxy replaces next.config.js rewrites to solve Vercel Edge 500 errors.
// Vercel Edge often blocks or fails to proxy to HTTP backends (like AWS Elastic Beanstalk).
// By using a Node.js Serverless function, we can reliably proxy requests and manage headers.

async function shadowProxy(req: NextRequest) {
  const isProd = process.env.NODE_ENV === 'production';
  // FORCE the backend URL in production to prevent infinite loops if NEXT_PUBLIC_API_URL was set to the Vercel domain.
  const backendBase = isProd 
    ? 'http://courseservermain-env.eba-6svqvpng.ap-south-1.elasticbeanstalk.com/api/v1' 
    : 'http://localhost:5050/api/v1';

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/v1/, '');
  const targetUrl = `${backendBase}${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length'); // Let fetch recalculate this

  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const arrayBuffer = await req.arrayBuffer();
      if (arrayBuffer.byteLength > 0) {
        body = arrayBuffer;
      }
    } catch (e) {
      console.warn("Failed to read request body:", e);
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

    response.headers.forEach((value, key) => {
      // Don't forward content-encoding, let Next.js handle compression
      if (key.toLowerCase() !== 'content-encoding') {
        res.headers.set(key, value);
      }
    });

    return res;
  } catch (error: any) {
    console.error(`[Proxy Error] Failed to fetch ${targetUrl}:`, error);
    return NextResponse.json(
      { message: 'Proxy Error: Could not connect to backend', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = shadowProxy;
export const POST = shadowProxy;
export const PUT = shadowProxy;
export const PATCH = shadowProxy;
export const DELETE = shadowProxy;
export const OPTIONS = shadowProxy;
