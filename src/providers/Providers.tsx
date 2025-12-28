'use client'

import PrivyProvider from '@/utils/privyProvider'
import ThemeProvider from './ThemeProvider'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <PrivyProvider>
        <WebSocketProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </WebSocketProvider>
      </PrivyProvider>
    </ThemeProvider>
  )
}
