
export enum Direction {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL',
  CHOP = 'CHOP'
}

export enum SignalAction {
  LONG = 'LONG',
  SHORT = 'SHORT',
  SKIP = 'SKIP',
  FLAT = 'FLAT'
}

export interface Metric {
  value: number;
  change?: number; // percent change
  trend?: 'up' | 'down' | 'flat';
  label: string;
  suffix?: string;
  prefix?: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface WhaleAlert {
  id: string;
  message: string;
  amount: number;
  asset: string;
  type: 'inflow' | 'outflow' | 'transfer';
  timestamp: number;
}

export interface EngineState {
  symbol: string;
  price: number;
  
  // REI Core Metrics
  reiScore: number; // 0-100
  regime: string; // "Momentum Bull", "Chop Decay", etc.
  oiMomentum: number; // % change
  mrZ: number; // Mean Reversion Z-Score
  projectedFunding: number; // % predicted next 8h
  expectancy: number; // Calculated viability score
  
  // Advanced Order Flow Scores (New)
  oiScore: number; // 0-100
  oiAlert?: string; // e.g. "Squeeze Risk"
  fundedScore: number; // 0-100
  fundedAlert?: string; // e.g. "Short Overcommitment"
  netLongShort: number; // % Net Longs (Positive) or Shorts (Negative)
  longShortRatio: number; // e.g. 1.5
  edgeReversal: boolean; // True if "Reversal Potential" condition met
  reversalDetails?: { // New: Specific metrics for the reversal condition
    consecutiveLongs: number; // Number of consecutive data points longs have risen
    negativeFundingHours: number; // Hours funding has been negative
  };
  
  // Dynamic Reversion Targets (New)
  reversionBand: {
    upper: number;
    lower: number;
    neutral: number;
  };

  // Legacy/Helper
  direction: Direction;
  action: SignalAction;
  confidence: number;
  fundingRate: number;
  openInterest: number; // in USD
  oiChange24h: number;
  cvd24h: number;
  liquidations24h: {
    long: number;
    short: number;
  };
  whaleRatio: number;
  atr: number;
  timestamp: number;
  
  // Feed
  news: NewsItem[];
  whaleAlerts: WhaleAlert[];
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  status: 'OPEN' | 'CLOSED';
  timestamp: number;
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  price: number; // close
  oi?: number;
  cvd?: number;
  funding?: number;
}

export interface ChartAlert {
  id: string;
  type: 'PRICE' | 'RSI' | 'SUPERTREND';
  condition: 'GT' | 'LT' | 'FLIP_BULL' | 'FLIP_BEAR';
  value: number; // Threshold for Price/RSI
  triggered: boolean;
  active: boolean;
  createdAt: number;
}

export interface TickerData {
  symbol: string;
  price: number;
  changePercent24h: number;
  volume: number; // Quote volume (USDT)
  high: number;
  low: number;
}

export interface ETFDataPoint {
  date: string;
  total: number;
  btcPrice: number;
  funds: {
    IBIT: number;
    FBTC: number;
    BITB: number;
    ARKB: number;
    BTCO: number;
    EZBC: number;
    BRRR: number;
    HODL: number;
    BTCW: number;
    GBTC: number;
    BTC: number; // Grayscale Mini
  }
}
