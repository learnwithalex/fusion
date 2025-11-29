import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from './providers';
import { Toaster } from 'sonner'

const _bricolage = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <html lang="en">
        <body className={`font-sans antialiased ${_bricolage.className}`}>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
              },
            }}
          />
          <Analytics />
        </body>
      </html>
    </Providers>
  )
}
