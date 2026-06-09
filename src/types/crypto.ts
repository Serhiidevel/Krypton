export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  high_24h: number;
  low_24h: number;
}

export interface Holding {
  assetId: string;
  name: string;
  symbol: string;
  amount: number;
  averageBuyPrice: number;
}

export interface Transaction {
  id: string;
  assetId: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: number;
}

export interface PortfolioState {
  cashBalance: number;
  holdings: Holding[];
  transactions: Transaction[];
}
