# AI Finance Agency - Frontend Dashboard

A comprehensive MVP frontend dashboard for the AI Finance Agency platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Pages
- **Dashboard**: Portfolio overview, market summary, recent signals, and quick actions
- **Trading Desk**: Real-time order placement and trade execution
- **Portfolio**: Detailed portfolio analytics and P&L tracking
- **Market Data**: Live market data, charts, and watchlists
- **Signals**: AI-generated trading signals and insights
- **Risk Management**: Portfolio risk assessment and monitoring
- **Education**: Trading courses and learning materials
- **Account Management**: Profile, billing, and settings

### Technical Features
- **Real-time Data**: WebSocket integration for live market data
- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Theme**: Automatic theme switching
- **State Management**: Zustand for efficient state handling
- **API Integration**: Complete microservices integration
- **Authentication**: JWT-based authentication flow
- **Charts & Visualizations**: Interactive charts with Recharts

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **WebSocket**: Native WebSocket with custom client

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Authentication pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components (header, sidebar)
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── api.ts            # API client and service functions
│   ├── config.ts         # Configuration constants
│   ├── utils.ts          # Utility functions
│   └── websocket.ts      # WebSocket client
├── providers/             # React context providers
├── store/                 # Zustand stores
│   ├── auth.ts           # Authentication state
│   ├── market.ts         # Market data state
│   └── portfolio.ts      # Portfolio state
└── types/                 # TypeScript type definitions
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.local` and configure the API endpoints:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000)

## API Integration

The frontend integrates with 10 microservices:

- **API Gateway** (3000): Central routing and authentication
- **User Management** (3002): Authentication and user profiles
- **Payment** (3001): Transaction processing and billing
- **Trading** (3004): Order execution and trade management
- **Signals** (3003): AI signal generation and analysis
- **Market Data** (3008): Real-time and historical market data
- **Risk Management** (3007): Portfolio risk assessment
- **Education** (3005): Learning content delivery
- **Notification** (3006): Multi-channel notifications
- **Content Intelligence** (3009): AI content analysis

## WebSocket Integration

Real-time features powered by WebSocket connections:

- Live market quotes and price updates
- Real-time trading signals
- Portfolio value updates
- Market status notifications
- Order execution confirmations

## Authentication Flow

1. **Login**: JWT-based authentication with User Management service
2. **Token Storage**: Secure token storage with automatic refresh
3. **Route Protection**: Protected routes with authentication checks
4. **Session Management**: Persistent sessions across browser restarts

## Development Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

Configure these environment variables in `.env.local`:

```bash
# API Endpoints
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_USER_MANAGEMENT_URL=http://localhost:3002
NEXT_PUBLIC_PAYMENT_URL=http://localhost:3001
NEXT_PUBLIC_TRADING_URL=http://localhost:3004
NEXT_PUBLIC_SIGNALS_URL=http://localhost:3003
NEXT_PUBLIC_MARKET_DATA_URL=http://localhost:3008
NEXT_PUBLIC_RISK_MANAGEMENT_URL=http://localhost:3007
NEXT_PUBLIC_EDUCATION_URL=http://localhost:3005
NEXT_PUBLIC_NOTIFICATION_URL=http://localhost:3006
NEXT_PUBLIC_CONTENT_INTELLIGENCE_URL=http://localhost:3009

# WebSocket
NEXT_PUBLIC_MARKET_DATA_WS=ws://localhost:3008
```

## Demo Credentials

For testing purposes, use these demo credentials:

- **Email**: demo@aifinance.com
- **Password**: demo123

## Features in Development

- [ ] Advanced charting with technical indicators
- [ ] Real-time chat and collaboration
- [ ] Mobile app with React Native
- [ ] Advanced portfolio analytics
- [ ] Social trading features
- [ ] Paper trading mode
- [ ] Advanced order types
- [ ] Portfolio optimization tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the AI Finance Agency platform. All rights reserved.