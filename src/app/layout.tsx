import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { ClientSessionProvider } from "@/components/layout/ClientSessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LinkInterceptor } from "@/components/providers/LinkInterceptor";
import { SystemConfigProvider } from "@/components/providers/SystemConfigProvider";
import { ReferralTracker } from "@/components/providers/ReferralTracker";
import { AffiliateWidget } from "@/components/shared/AffiliateWidget";
import { PhoneCaptureModal } from "@/components/shared/PhoneCaptureModal";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "EmberQuest | Master the Future of Engineering",
    template: "%s | EmberQuest",
  },
  description:
    "EmberQuest is the premium learning platform from Skilvi. Expert-taught courses in software engineering, system architecture, cloud computing, and DevOps — designed to turn developers into technical leaders.",
  keywords: [
    "online courses",
    "software engineering",
    "system architecture",
    "cloud computing",
    "DevOps",
    "full-stack development",
    "NestJS",
    "Next.js",
    "React",
    "EmberQuest",
    "Skilvi",
  ],
  authors: [{ name: "EmberQuest" }],
  creator: "EmberQuest — powered by Skilvi",
  publisher: "Skilvi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "EmberQuest",
    title: "EmberQuest | Master the Future of Engineering",
    description:
      "The premium learning platform from Skilvi. Expert-led curriculums in software, cloud, and architecture.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EmberQuest | Master the Future of Engineering",
    description:
      "Premium learning platform powered by Skilvi. Master software engineering, system architecture, and cloud.",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextTopLoader color="#10b981" showSpinner={true} height={4} speed={300} zIndex={1600} />
          <ReferralTracker />
          <AffiliateWidget />
          <SystemConfigProvider>
            <ClientSessionProvider>
              <PhoneCaptureModal />
              <ToastProvider>
                <LinkInterceptor>
                  <Header />
                  <div className="min-h-screen flex flex-col pt-16 bg-white dark:bg-slate-950 transition-colors duration-300">
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <BottomNavBar />
                  </div>
                </LinkInterceptor>
              </ToastProvider>
            </ClientSessionProvider>
          </SystemConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
