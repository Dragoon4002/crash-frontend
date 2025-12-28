// Bot names and emojis for Candleflip opponents
export const BOT_NAMES = [
  { name: 'CryptoBot', emoji: '🤖' },
  { name: 'TradeWizard', emoji: '🧙' },
  { name: 'BullBot', emoji: '🐂' },
  { name: 'BearBot', emoji: '🐻' },
];

export function getRandomBot(): { name: string; emoji: string } {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
}

// Generate consistent bot for a room (same roomId always gets same bot)
export function getBotForRoom(roomId: string): { name: string; emoji: string } {
  // Simple hash function to convert roomId to index
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) {
    hash = ((hash << 5) - hash) + roomId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % BOT_NAMES.length;
  return BOT_NAMES[index];
}
