import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Khóa học giá rẻ',
  description: 'Nền tảng học tập trực tuyến',
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
