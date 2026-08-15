import { NextResponse } from 'next/server';
import { getServerBackendUrl } from '@/lib/api/server-url';

export async function GET() {
  try {
    const backendUrl = getServerBackendUrl();
    const url = `${backendUrl}/search/courses?sortBy=rating&limit=8`;
    
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: `Fetch failed with status ${res.status}` });
    }
    const data = await res.json();
    return NextResponse.json({ success: true, url, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, name: e.name, stack: e.stack });
  }
}
