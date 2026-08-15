/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**', // Broadened to support all versions and styles (adventurer, initials, etc.)
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'emberquestvideodata.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'emberquest-materials.s3.ap-south-1.amazonaws.com',
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true, // Fixes 502 Bad Gateway for S3 presigned URLs & improves load speed
  },
  async redirects() {
    return [
      // Unify /search → /courses (enterprise-grade single source of truth URL)
      {
        source: '/search',
        destination: '/courses',
        permanent: false, // 307, preserves query params like ?sortBy=rating&q=...
      },
    ];
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    const prodApiUrl = 'http://courseservermain-env.eba-6svqvpng.ap-south-1.elasticbeanstalk.com/api/v1';
    
    // FORCE destination to the backend. If NEXT_PUBLIC_API_URL accidentally points to Vercel, it creates an infinite 500 loop.
    const apiUrl = isProd ? prodApiUrl : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1');
    
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
