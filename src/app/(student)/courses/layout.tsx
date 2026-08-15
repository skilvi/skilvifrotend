import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Courses — Expert-Taught Engineering Mastery | EmberQuest',
  description:
    'Browse our complete library of expert-taught courses in software engineering, system architecture, cloud computing, DevOps, and more.',
  openGraph: {
    title: 'Explore Courses | EmberQuest',
    description: 'Expert-taught courses in software engineering, architecture, and cloud computing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Courses | EmberQuest',
    description: 'Expert-taught courses in software engineering, architecture, and cloud computing.',
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
