import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile — Account Settings | EmberQuest',
  description:
    'Manage your EmberQuest profile, update your display name, bio, and account preferences.',
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
