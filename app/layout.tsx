import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fractler',
  description: 'Fractal Generator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
