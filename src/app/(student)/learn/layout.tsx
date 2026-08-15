import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learning Environment | EmberQuest',
  description:
    'Immersive video learning experience with progress tracking, Q&A, and secure playback on EmberQuest.',
  robots: { index: false, follow: false },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
