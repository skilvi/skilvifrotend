import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Reviews — Student Feedback | EmberQuest',
  description: 'View and respond to student reviews across all your courses on EmberQuest.',
  robots: { index: false, follow: false },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
