import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instructor Profile — Settings | EmberQuest',
  description: 'Update your instructor profile, bio, social links, and professional details on EmberQuest.',
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
