'use client'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ServerChat } from '../chat/ServerChat'

export function NewSidebar() {
  return (
    <Sidebar>
      <SidebarHeader title="Chat" className='h-15 grid place-items-center w-full'>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="text-2xl">🏔️</div>
          <div className="flex items-baseline gap-1">
            <h1 className="text-2xl font-black text-white tracking-tight">RUGS.FUN</h1>
            <span className="text-[9px] text-yellow-500 font-bold px-1 py-0.5 bg-yellow-500/10 rounded">BETA</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='border-r border-white/15'>
          <SidebarGroupContent className='h-full '>
            <ServerChat />
          </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className='border-r border-white/15'>
        <div className='p-4 text-center h-20 text-sm text-white/50'>
          © 2024 RUGS.FUN
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}