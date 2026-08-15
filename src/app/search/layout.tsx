import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Courses — Find Your Next Skill | EmberQuest',
  description:
    'Search and discover expert-taught courses in software engineering, architecture, design, and more on EmberQuest.',
  openGraph: {
    title: 'Search Courses | EmberQuest',
    description: 'Discover expert-taught courses in engineering, architecture, and design.',
    type: 'website',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
