import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Video Streaming Website',
  description: 'Watch videos with device management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

