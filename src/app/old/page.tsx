'use client'

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Header } from '@/components/layout/Header';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { StandardMode } from '@/components/pages/StandardMode';
import { CandleflipMode } from '@/components/pages/CandleflipMode';
import { BattlesMode } from '@/components/pages/BattlesMode';
import { GameMode } from '@/lib/types';
import { MessageCircle } from 'lucide-react';

export default function Home() {
  const [currentMode, setCurrentMode] = useState<GameMode>('standard');
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const { authenticated } = usePrivy();

  const toggleChat = () => {
    setIsChatCollapsed(!isChatCollapsed);
  };

  const renderContent = () => {
    switch (currentMode) {
      case 'standard':
        return <StandardMode />;
      case 'candleflip':
        return <CandleflipMode />;
      case 'battles':
        return <BattlesMode />;
      default:
        return <StandardMode />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f]">
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />

      {/* Network Checker - shows warning if on wrong network */}
      {/* <NetworkChecker /> */}

      <div className="flex flex-1 overflow-hidden relative">
        <ChatSidebar
          isConnected={authenticated}
          isCollapsed={isChatCollapsed}
          onToggleCollapse={toggleChat}
        />
        {renderContent()}

          <button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-500/30 z-50 transition-all hover:scale-110"
          >
            {/* <MessageCircle className="h-6 w-6" /> */}
          </button>
      </div>
    </div>
  );
}
