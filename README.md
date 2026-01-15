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
├── app/                      # Next.js app directory
├── components/
│   ├── ui/                   # shadcn components
│   ├── layout/               # Layout components
│   ├── trading/              # Trading components
│   ├── candleflip/           # Candleflip components
│   ├── chat/                 # Chat components
│   ├── leaderboard/          # Leaderboard components
│   └── pages/                # Page components
├── contexts/                 # React contexts
├── contracts/                # Contract ABIs
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities & mock data
├── providers/                # Context providers
├── types/                    # TypeScript types
└── utils/                    # Helper utilities
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

## Backend Connection

The app connects to the Go backend via WebSocket:

```
ws://localhost:8080/ws           # Unified WebSocket (crash, chat, rooms)
ws://localhost:8080/candleflip   # Candleflip game
```

Add to `.env.local`:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## Development

Mock data is available in `src/lib/mockData.ts` for offline development.

## Deploy on Vercel

Deploy using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
