import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "katex/dist/katex.min.css";
import "./globals.css";
const prose = localFont({
  src: [
    {
      path: "./fonts/newsreader-latin-standard-normal.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "./fonts/newsreader-latin-standard-italic.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-prose",
  display: "swap",
  preload: false,
});
const proseExt = localFont({
  src: [
    {
      path: "./fonts/newsreader-latin-ext-standard-normal.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "./fonts/newsreader-latin-ext-standard-italic.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-prose-ext",
  display: "swap",
  preload: false,
});
const ui = localFont({
  src: "./fonts/instrument-sans-latin-standard-normal.woff2",
  weight: "400 700",
  variable: "--font-ui",
  display: "swap",
});
const uiExt = localFont({
  src: "./fonts/instrument-sans-latin-ext-standard-normal.woff2",
  weight: "400 700",
  variable: "--font-ui-ext",
  display: "swap",
  preload: false,
});
const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
const monoExt = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-ext-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-latin-ext-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-mono-ext",
  display: "swap",
  preload: false,
});
export const metadata: Metadata = {
  title: "Noetherwake — Mathematics and physics",
  description:
    "Connected mathematics and physics. Read, predict, practise, and follow the evidence. Stored on your device.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  appleWebApp: {
    capable: true,
    title: "Noetherwake",
    statusBarStyle: "default",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1EFF9" },
    { media: "(prefers-color-scheme: dark)", color: "#1A142A" },
  ],
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${prose.variable} ${proseExt.variable} ${ui.variable} ${uiExt.variable} ${mono.variable} ${monoExt.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
