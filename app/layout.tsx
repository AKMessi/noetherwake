import type { Metadata, Viewport } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
export const metadata: Metadata = {
  title: 'Noetherwake — A clearer path through math & physics',
  description:
    'An offline learning observatory. Understand what you know, discover your next step, and make it stick.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Noetherwake',
    statusBarStyle: 'default',
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#153e36',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
