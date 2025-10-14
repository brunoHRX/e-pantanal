import './globals.css'
// app/layout.tsx
import { ReactNode } from 'react'
import ClientLayout from '@/components/ClientLayout'
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <title>E-pantanal</title>
      <body
        className="
      min-h-screen
      supports-[height:100dvh]:min-h-[100dvh]
      overflow-x-hidden
    "
      >
        <ClientLayout>
          {children}
          <Toaster richColors position="top-right" />
        </ClientLayout>
      </body>
    </html>
  )
}
