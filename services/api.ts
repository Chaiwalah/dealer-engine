
import { EngineState, Direction, SignalAction, ChartDataPoint, Trade, TickerData, ETFDataPoint, NewsItem, WhaleAlert } from '../types';

// --- CONFIGURATION ---
const USE_SIMULATION = true; // Forces mock data to ensure app works without backend/CORS issues

// --- MOCK GENERATORS (High Fidelity) ---

const generateMockTickers = (): TickerData[] => {
  const assets = [
    { s: 'BTC', p: 64230.50, v: 45000000000 },
    { s: 'ETH', p: 3450.20, v: 18000000000 },
    { s: 'SOL', p: 145.80, v: 4500000000 },
    { s: 'XRP', p: 0.62, v: 1200000000 },
    { s: 'DOGE', p: 0.16, v: 900000000 },
    { s: 'BNB', p: 590.10, v: 800000000 },
    { s: 'ADA', p: 0.45, v: 400000000 },
    { s: 'AVAX', p: 45.20, v: 350000000 },
    { s: 'LINK', p: 18.40, v: 300000000 },
    { s: 'DOT', p: 7.20, v: 200000000 },
    { s: 'MATIC', p: 0.85, v: 150000000 },
    { s: 'LTC', p: 85.00, v: 100000000 },
    { s: 'SHIB', p: 0.000025, v: 800000000 },
    { s: 'UNI', p: 10.50, v: 120000000 },
    { s: 'NEAR', p: 6.80, v: 110000000 },
    { s: 'STX', p: 2.40, v: 90000000 }
  ];

  return assets.map(a => ({
    symbol: a.s,
    price: a.p * (1 + (Math.random() * 0.02 - 0.01)),
    changePercent24h: (Math.random() * 10) - 4,
    volume: a.v * (1 + (Math.random() * 0.2 - 0.1)),
    high: a.p * 1.05,
    low: a.p * 0.95
  })).sort((a, b) => b.volume - a.volume);
};

const generateMockChartData = (points: number, basePrice: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let price = basePrice;
  let cvd = 0;
  let oi = basePrice * 100; // Rough correlation
  const now = new Date();

  // Create a smoother funding rate random walk
  let currentFunding = 0.01; 

  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i) * 15 * 60000); // 15m candles
    
    const volatility = price * 0.005;
    const change = (Math.random() - 0.5) * volatility;
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + (Math.random() * volatility * 0.5);
    const low = Math.min(open, close) - (Math.random() * volatility * 0.5);
    
    price = close;

    // Simulate Order Flow
    const vol = Math.abs(change) * 100000 + (Math.random() * 100000);
    const delta = change > 0 ? vol * 0.6 : -vol * 0.6;
    cvd += delta;
    
    oi += (Math.random() - 0.5) * vol * 0.1;

    // Simulate Funding Rate (small percentages, e.g. 0.01%)
    // Random walk with mean reversion to 0.01
    const fundingChange = (Math.random() * 0.002) - 0.001;
    currentFunding += fundingChange;
    // Mean revert slightly
    currentFunding = currentFunding * 0.95 + 0.01 * 0.05;

    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open,
      high,
      low,
      price: close,
      cvd,
      oi: Math.max(0, oi),
      funding: currentFunding
    });
  }
  return data;
};

// --- API METHODS ---

export const fetchMarketTickers = async (): Promise<TickerData[]> => {
  // CORS block on Binance is common in browser. We default to sim for stability.
  return new Promise(resolve => {
    setTimeout(() => resolve(generateMockTickers()), 400); 
  });
};

export const fetchETFData = async (): Promise<ETFDataPoint[]> => {
  // Realistic mocked ETF flows
  const data: ETFDataPoint[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isWeekEnd = d.getDay() === 0 || d.getDay() === 6;
    
    const ibit = isWeekEnd ? 0 : (Math.random() > 0.3 ? Math.random() * 400 : -Math.random() * 50);
    const fbtc = isWeekEnd ? 0 : (Math.random() > 0.4 ? Math.random() * 200 : -Math.random() * 30);
    const gbtc = isWeekEnd ? 0 : -(Math.random() * 150); 
    
    data.push({
      date: d.toISOString().split('T')[0],
      total: ibit + fbtc + gbtc,
      btcPrice: 65000 + (Math.random() * 2000),
      funds: {
        IBIT: ibit, FBTC: fbtc, BITB: isWeekEnd ? 0 : Math.random() * 40, 
        ARKB: isWeekEnd ? 0 : Math.random() * 30, BTCO: 0, EZBC: 0, 
        BRRR: 0, HODL: 0, BTCW: 0, GBTC: gbtc, BTC: 0
      }
    });
  }
  return data;
};

export const fetchChartData = async (symbol: string): Promise<ChartDataPoint[]> => {
  // Determine base price based on symbol for realism
  let basePrice = 100;
  if (symbol.includes('BTC')) basePrice = 64500;
  else if (symbol.includes('ETH')) basePrice = 3450;
  else if (symbol.includes('SOL')) basePrice = 145;
  else if (symbol.includes('XRP')) basePrice = 0.60;
  
  return new Promise(resolve => {
    setTimeout(() => resolve(generateMockChartData(100, basePrice)), 500);
  });
};

export const fetchEngineState = async (symbol: string): Promise<EngineState> => {
  // Use chart data generator to get a price consistent with the chart
  const cData = await fetchChartData(symbol);
  const lastCandle = cData[cData.length - 1];
  const price = lastCandle.price;

  // Calculate randomized but consistent metrics
  const reiScore = Math.floor(Math.random() * 100);
  let regime = "Neutral Chop";
  if (reiScore > 70) regime = "Momentum Bull";
  else if (reiScore < 30) regime = "Decay Reversion";
  else if (reiScore > 40 && reiScore < 60) regime = "Range Bound";

  const oiMomentum = (Math.random() * 10) - 5;
  const fundingRate = lastCandle.funding || 0.01;
  const netLongShort = (Math.random() * 40) - 20; // -20 to +20

  return {
    symbol,
    price,
    reiScore,
    regime,
    oiMomentum,
    mrZ: (Math.random() * 6) - 3, // -3 to +3
    projectedFunding: fundingRate * 1.05,
    expectancy: (Math.random() * 10) - 2,
    
    oiScore: Math.floor(Math.random() * 100),
    oiAlert: oiMomentum > 4 ? "Squeeze Risk" : undefined,
    fundedScore: Math.floor(Math.random() * 100),
    fundedAlert: fundingRate > 0.02 ? "Overheated" : undefined,
    netLongShort,
    longShortRatio: 1 + (netLongShort / 100),
    edgeReversal: reiScore < 20 && fundingRate < 0,
    reversalDetails: {
      consecutiveLongs: 3,
      negativeFundingHours: 4
    },
    
    reversionBand: {
      upper: price * 1.05,
      lower: price * 0.95,
      neutral: price
    },

    direction: reiScore > 50 ? Direction.BULLISH : Direction.BEARISH,
    action: SignalAction.FLAT,
    confidence: 80,
    fundingRate: fundingRate,
    openInterest: price * 500000,
    oiChange24h: oiMomentum,
    cvd24h: (Math.random() * 1000000) - 500000,
    liquidations24h: { long: 500000, short: 400000 },
    whaleRatio: Math.random(),
    atr: price * 0.02,
    timestamp: Date.now(),
    news: [
      { id: '1', headline: `${symbol} sees institutional inflow`, source: 'Bloomberg', time: '5m', sentiment: 'positive' },
      { id: '2', headline: 'Regulatory talks continue in EU', source: 'Reuters', time: '1h', sentiment: 'neutral' },
      { id: '3', headline: 'Derivative volume spikes 20%', source: 'Coinglass', time: '2h', sentiment: 'positive' }
    ],
    whaleAlerts: [
      { id: '1', message: `🚨 5,000 ${symbol.split('-')[0]} moved to Binance`, amount: 5000, asset: symbol, type: 'inflow', timestamp: Date.now() - 100000 }
    ]
  };
};

export const fetchRecentTrades = async (): Promise<Trade[]> => {
    return [
      { id: '1', symbol: 'SOL-USD', side: 'LONG', entryPrice: 142.5, status: 'OPEN', timestamp: Date.now() - 3600000 },
      { id: '2', symbol: 'BTC-USD', side: 'SHORT', entryPrice: 66200, exitPrice: 65800, pnl: 400, status: 'CLOSED', timestamp: Date.now() - 86400000 },
    ];
};

export const calculateIndicators = (data: ChartDataPoint[]) => {
    // Simplified stub
    return { rsi: 55, supertrend: { direction: 1 } };
};
