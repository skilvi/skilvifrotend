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
};

module.exports = nextConfig;
