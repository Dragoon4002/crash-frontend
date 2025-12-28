export const COLORS = {
  background: {
    primary: '#0a0a0f',
    secondary: '#1a1a2e',
    card: '#14141f',
  },
  accent: {
    green: '#22c55e',
    red: '#ef4444',
    gold: '#f59e0b',
    orange: '#fb923c',
  },
  text: {
    primary: '#ffffff',
    secondary: '#9ca3af',
    muted: '#6b7280',
  },
} as const;

export const GAME_MODES = [
  { id: 'standard', label: 'Standard', icon: '🔥' },
  { id: 'candleflip', label: 'Candleflip', icon: '💖' },
  { id: 'battles', label: 'Battles', icon: '⚔️' },
] as const;

export const MULTIPLIER_LEVELS = [0.5, 1, 1.5, 2, 2.5];

export const PERCENTAGE_OPTIONS = [10, 25, 50, 100];

export const QUICK_ADD_AMOUNTS = [0.001, 0.01, 0.1, 1];

export const LEADERBOARD_TIME_FILTERS = ['24 Hours', '7 Days', '30 Days'] as const;
