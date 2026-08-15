import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Dashboard — Track Your Learning Progress | EmberQuest',
  description:
    'View your enrolled courses, track completion progress, and continue your engineering mastery journey on EmberQuest.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
