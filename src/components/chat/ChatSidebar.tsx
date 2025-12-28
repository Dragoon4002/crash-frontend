'use client'

import { ServerChat } from './ServerChat';
import { ChevronLeft } from 'lucide-react';

interface ChatSidebarProps {
  isConnected: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatSidebar({ isConnected, isCollapsed = false, onToggleCollapse }: ChatSidebarProps) {
  if (isCollapsed) {
    return null;
  }

  return (
    <div className="w-80 bg-[#0a0a0f] border-r border-white/20 flex flex-col h-full relative">
      <ServerChat />

      {/* Collapse Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 bottom-20 bg-[#14141f] border border-white/10 rounded-full p-1 hover:bg-white/5 transition-colors z-10"
        >
          <ChevronLeft className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}
