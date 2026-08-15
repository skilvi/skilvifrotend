import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Performance Analytics — Instructor Dashboard | EmberQuest',
  description: 'Deep dive into student engagement, course reach, completion rates, and watch time analytics.',
  robots: { index: false, follow: false },
};

export default function PerformanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
