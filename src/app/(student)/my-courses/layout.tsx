import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Courses — Your Learning Library | EmberQuest',
  description:
    'View and manage all your enrolled courses. Track progress and continue your learning journey on EmberQuest.',
  robots: { index: false, follow: false },
};

export default function MyCoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
