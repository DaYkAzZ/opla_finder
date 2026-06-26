import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PostHogProvider } from '@/components/PostHogProvider'
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Opla",
  description: "Trouve où manger en moins de 10 secondes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Opla",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        style={{
          fontFamily:
            '-apple-system, "SF Pro Display", "SF Pro Rounded", BlinkMacSystemFont, "Segoe UI", sans-serif',
          backgroundColor: "#FEFDFE",
          color: "#1A1A1A",
          margin: 0,
          padding: 0,
          minHeight: "100dvh",
        }}
      >
        <PostHogProvider>
          <main style={{ paddingBottom: "96px" }}>{children}</main>
          <BottomNav />
        </PostHogProvider>
      </body>
    </html>
  );
}
