'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Send, Wifi, WifiOff } from 'lucide-react';

export function ServerChat() {
  const { chatMessages, isConnected, connectedUsers, sendChatMessage, subscribe, unsubscribe } = useWebSocket();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    subscribe('chat');
    return () => unsubscribe('chat');
  }, [subscribe, unsubscribe]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendChatMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-y border-[#30363d] px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 w-full">
            {isConnected ? (
              <div className="flex justify-between w-full  items-center gap-1 text-green-400 text-xs">
                <span className='flex items-center gap-1'>
                  <Wifi className="w-3 h-3" />
                  <span>Online</span>
                </span>
                <span>{connectedUsers} {connectedUsers > 1 ? 'Users' : 'User'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400 text-xs">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            No messages yet. Be the first to say something!
          </div>
        )}
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`${
              msg.type === 'system'
                ? 'text-center'
                : 'flex flex-col'
            }`}
          >
            {msg.type === 'system' ? (
              <div className="text-xs text-gray-500 italic">
                {msg.message}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#58a6ff]">
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-[#232323] rounded-lg px-3 py-2 text-sm text-gray-300">
                  {msg.message}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#161b22] border-t border-[#30363d] p-4 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#58a6ff] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !inputMessage.trim()}
            className="p-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-white transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
