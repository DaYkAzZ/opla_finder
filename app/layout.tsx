import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
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
  themeColor: "#FEFDFE",
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
      <body>
        <PostHogProvider>
          <main style={{ paddingBottom: "var(--nav-height)" }}>{children}</main>
          <BottomNav />
        </PostHogProvider>
      </body>
    </html>
  );
}
