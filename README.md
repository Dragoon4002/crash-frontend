# RUGS.FUN - Crypto Trading & Betting Platform

A comprehensive crypto trading and betting platform with three game modes: Standard, Candleflip, and Battles.

## Features

### 🎮 Three Game Modes

1. **Standard Mode** - Live trading with candlestick charts
   - Real-time price multiplier display
   - Live traders sidebar showing P&L
   - Trading panel with SOL betting
   - Leaderboard with top 3 podium display
   - Historical candle previews
   - Stats tracking (2X, 10X, 50X hits)

2. **Candleflip Mode** - Multiplayer betting games
   - Grid view of active and completed games
   - Bullish vs Bearish betting
   - Prize pool display
   - Live game status with mini charts
   - Winner announcements

3. **Battles Mode** - Coming Soon

### 🎨 UI Components

#### Navigation Header
- RUGS.FUN branding with Beta badge
- Three game mode tabs with icons
- Level indicator with XP progress bar
- Rugpass tier badge
- Wallet connect button

#### Chat Sidebar
- Online user count (198+)
- Social media integration (Discord, Twitter, Telegram)
- Chat messages with user levels and badges
- Achievement announcements
- Moderation badges (PARTNER, MOD, VIP)
- Chat rules link

#### Trading Components
- **TradingChart**: Candlestick chart with multiplier levels (0.5x - 2.5x)
- **TradingPanel**:
  - Amount input with SOL balance
  - Quick add buttons (+0.001, +0.01, +0.1, +1)
  - Helper buttons (1/2, X2, MAX)
  - Percentage presets (10%, 25%, 50%, 100%)
  - Large BUY (green) and SELL (red) buttons
- **LiveTraders**: Real-time P&L tracking sidebar

#### Leaderboard
- Time filters (24 Hours, 7 Days, 30 Days)
- Podium display for top 3 players with medals
- Gradient backgrounds for each rank
- Table view for ranks 4-20+
- Color-coded avatars by rank tier

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Authentication**: Privy (integrated but not active)
- **Theme**: next-themes (dark mode ready)

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   ├── layout/               # Layout components
│   ├── trading/              # Trading components
│   ├── candleflip/           # Candleflip components
│   ├── chat/                 # Chat components
│   ├── leaderboard/          # Leaderboard components
│   └── pages/                # Page components
├── lib/                      # Utilities & types
├── providers/                # Context providers
└── app/                      # Next.js app directory
```

## Color Scheme

- **Background**: `#0a0a0f` (Very dark navy)
- **Secondary Background**: `#14141f` (Dark card background)
- **Green (Bullish)**: `#22c55e`
- **Red (Bearish)**: `#ef4444`
- **Gold/Yellow**: `#f59e0b` (Rankings, special badges)
- **Orange**: `#fb923c` (Accents)

## Getting Started

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
```

## Development

The app uses mock data defined in `src/lib/mockData.ts`. To connect to real APIs:

1. Create custom hooks in `src/hooks/` for data fetching
2. Implement WebSocket connections for real-time updates
3. Replace mock data with API calls
4. Add state management (Zustand/Redux) if needed

## Deploy on Vercel

Deploy using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
