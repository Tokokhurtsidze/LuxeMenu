import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { WebLocaleProvider } from '@/contexts/WebLocaleContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const inter    = Inter({             subsets: ['latin'], variable: '--font-inter',    display: 'swap' })

export const metadata: Metadata = {
  title: 'AuraMenu — Smart Luxury QR Menus',
  description: 'Premium digital menu experience for fine dining establishments.',
  icons: {
    icon:  '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <WebLocaleProvider>
            {children}
          </WebLocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
