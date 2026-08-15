import { NextResponse } from 'next/server';
import { getServerBackendUrl } from '@/lib/api/server-url';

export async function GET() {
  const backendUrl = getServerBackendUrl();
  return NextResponse.json({ 
    backendUrl,
    envUrl: process.env.NEXT_PUBLIC_API_URL,
    isProd: process.env.NODE_ENV === 'production'
  });
}
