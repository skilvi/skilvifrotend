import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Q&A Messages — Student Support | EmberQuest',
  description: 'Manage and respond to student questions across your courses on EmberQuest.',
  robots: { index: false, follow: false },
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
