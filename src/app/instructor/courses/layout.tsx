import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Courses — Course Management | EmberQuest',
  description: 'Create, edit, and manage your course catalog on EmberQuest instructor dashboard.',
  robots: { index: false, follow: false },
};

export default function InstructorCoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
