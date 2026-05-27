import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalAudio from "@/components/GlobalAudio";
import SynthwaveGrid from "@/components/SynthwaveGrid";
import BroadcastBanner from "@/components/BroadcastBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoboVibe | Creative Playground",
  description: "Advanced generative dynamics, high-fidelity simulations, and creative tools.",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col grid-bg" suppressHydrationWarning>
        <BroadcastBanner />
        <SynthwaveGrid />
        <GlobalAudio />
        {children}
      </body>
    </html>
  );
}
