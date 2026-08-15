export function getServerBackendUrl(): string {
  const isProd = process.env.NODE_ENV === 'production';
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Ensure the URL doesn't end with a trailing slash
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }

  // Aggressively clean up any double slashes (e.g. from user input errors like .com//api/v1)
  // except for the http:// or https:// part
  apiUrl = apiUrl.replace(/([^:]\/)\/+/g, "$1");

  // Ensure /api/v1 is present (User might have set it to just the domain)
  if (apiUrl && !apiUrl.endsWith('/api/v1')) {
    apiUrl = `${apiUrl}/api/v1`;
  }
  
  // If NEXT_PUBLIC_API_URL is already an absolute URL (like http://localhost:5050/api/v1), use it.
  if (apiUrl.startsWith('http')) {
    return apiUrl;
  }
  
  // Server components need an absolute URL. If it's relative (e.g. /api/v1 on Vercel),
  // fallback to the direct Elastic Beanstalk backend URL.
  if (isProd) {
    return 'http://courseservermain-env.eba-6svqvpng.ap-south-1.elasticbeanstalk.com/api/v1';
  }
  
  return 'http://localhost:5050/api/v1';
}
