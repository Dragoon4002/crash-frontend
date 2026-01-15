'use client'

import PrivyProvider from '@/utils/privyProvider'
import ThemeProvider from './ThemeProvider'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ToastProvider>
        <PrivyProvider>
          <WebSocketProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </WebSocketProvider>
        </PrivyProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
