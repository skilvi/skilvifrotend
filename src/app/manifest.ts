import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EmberQuest | Master the Future of Engineering',
    short_name: 'EmberQuest',
    description: 'Expert-taught courses in software engineering, system architecture, cloud computing, and DevOps.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: '/logo.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  };
}
