import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'
import AuthGuard from '@/components/AuthGuard'
import NavWrapper from '@/components/NavWrapper'

export const metadata: Metadata = {
  title: 'Opla',
  description: 'Trouve où manger en moins de 10 secondes.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Opla',
  },
}

export const viewport: Viewport = {
  themeColor: '#FEFDFE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <PostHogProvider>
          <AuthGuard>
            <NavWrapper>{children}</NavWrapper>
          </AuthGuard>
        </PostHogProvider>
      </body>
    </html>
  )
}
