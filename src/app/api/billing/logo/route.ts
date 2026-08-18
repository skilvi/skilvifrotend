import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const LOGO_URL = 'https://assets.emberquest.in/skilvi/logo.svg';
    
    // Fetch the logo from the external server
    const response = await fetch(LOGO_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.statusText}`);
    }

    const svgData = await response.text();

    return new NextResponse(svgData, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        // Allow the browser to cache it heavily to avoid repeated proxy calls
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000',
      },
    });
  } catch (error) {
    console.error('Error proxying logo:', error);
    return new NextResponse('Error fetching logo', { status: 500 });
  }
}
