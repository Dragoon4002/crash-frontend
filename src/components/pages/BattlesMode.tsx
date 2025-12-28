'use client'

import { Card } from '@/components/ui/card';
import { Swords } from 'lucide-react';

export function BattlesMode() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Card className="bg-[#14141f] border-white/5 p-12">
        <div className="text-center space-y-4">
          <Swords className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="text-2xl font-bold text-white">Battles Mode</h2>
          <p className="text-gray-400">Coming Soon...</p>
        </div>
      </Card>
    </div>
  );
}
