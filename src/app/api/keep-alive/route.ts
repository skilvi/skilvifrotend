import { NextResponse } from 'next/server';

import { getServerBackendUrl } from '@/lib/api/server-url';

export async function GET() {
  const backendUrl = getServerBackendUrl();
  
  try {
    // Ping the backend's health endpoint to reset its sleep timer (in case this was invoked externally)
    await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'EmberQuest-KeepAlive-Frontend',
      },
    });
  } catch (error) {
    console.error('Failed to ping backend from keep-alive route', error);
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Keep-alive ping successful. Frontend and backend are awake.',
    timestamp: new Date().toISOString(),
  });
}
