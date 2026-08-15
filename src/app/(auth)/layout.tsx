import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In or Register | EmberQuest',
  description:
    'Access your EmberQuest account. Log in to continue learning or create a free account to start mastering enterprise engineering skills.',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
