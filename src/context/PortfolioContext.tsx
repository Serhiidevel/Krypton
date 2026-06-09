import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  CryptoAsset,
  Holding,
  PortfolioState,
  Transaction,
} from '../types/crypto';

const INITIAL_CASH_BALANCE = 10000;
const STORAGE_KEY = 'krypton-portfolio';

const initialPortfolioState: PortfolioState = {
  cashBalance: INITIAL_CASH_BALANCE,
  holdings: [],
  transactions: [],
};

interface PortfolioContextValue extends PortfolioState {
  buyAsset: (asset: CryptoAsset, amount: number) => string | null;
  sellAsset: (assetId: string, amount: number) => string | null;
}

interface PortfolioProviderProps {
  children: ReactNode;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(
  undefined,
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isHolding(value: unknown): value is Holding {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.assetId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.symbol === 'string' &&
    typeof value.amount === 'number' &&
    typeof value.averageBuyPrice === 'number'
  );
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.assetId === 'string' &&
    (value.type === 'BUY' || value.type === 'SELL') &&
    typeof value.amount === 'number' &&
    typeof value.price === 'number' &&
    typeof value.timestamp === 'number'
  );
}

function isPortfolioState(value: unknown): value is PortfolioState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.cashBalance === 'number' &&
    Array.isArray(value.holdings) &&
    value.holdings.every(isHolding) &&
    Array.isArray(value.transactions) &&
    value.transactions.every(isTransaction)
  );
}

function loadPortfolioState(): PortfolioState {
  if (typeof window === 'undefined') {
    return initialPortfolioState;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (storedValue === null) {
    return initialPortfolioState;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    if (isPortfolioState(parsedValue)) {
      return parsedValue;
    }
  } catch {
    return initialPortfolioState;
  }

  return initialPortfolioState;
}

function createTransaction(
  assetId: string,
  type: Transaction['type'],
  amount: number,
  price: number,
): Transaction {
  return {
    id: crypto.randomUUID(),
    assetId,
    type,
    amount,
    price,
    timestamp: Date.now(),
  };
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const [portfolio, setPortfolio] = useState<PortfolioState>(loadPortfolioState);
  const portfolioRef = useRef<PortfolioState>(portfolio);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  const updatePortfolio = useCallback((nextPortfolio: PortfolioState) => {
    portfolioRef.current = nextPortfolio;
    setPortfolio(nextPortfolio);
  }, []);

  const buyAsset = useCallback(
    (asset: CryptoAsset, amount: number): string | null => {
      if (amount <= 0) {
        return 'Buy amount must be greater than zero.';
      }

      const currentPortfolio = portfolioRef.current;
      const totalCost = asset.current_price * amount;

      if (currentPortfolio.cashBalance < totalCost) {
        return 'Not enough cash to complete this purchase.';
      }

      const existingHolding = currentPortfolio.holdings.find(
        (holding) => holding.assetId === asset.id,
      );

      const transaction = createTransaction(
        asset.id,
        'BUY',
        amount,
        asset.current_price,
      );

      if (existingHolding === undefined) {
        updatePortfolio({
          cashBalance: currentPortfolio.cashBalance - totalCost,
          holdings: [
            ...currentPortfolio.holdings,
            {
              assetId: asset.id,
              name: asset.name,
              symbol: asset.symbol,
              amount,
              averageBuyPrice: asset.current_price,
            },
          ],
          transactions: [...currentPortfolio.transactions, transaction],
        });

        return null;
      }

      const updatedHoldings = currentPortfolio.holdings.map((holding) => {
        if (holding.assetId !== asset.id) {
          return holding;
        }

        const newAmount = holding.amount + amount;
        const newAverageBuyPrice =
          (holding.amount * holding.averageBuyPrice + totalCost) / newAmount;

        return {
          ...holding,
          amount: newAmount,
          averageBuyPrice: newAverageBuyPrice,
        };
      });

      updatePortfolio({
        cashBalance: currentPortfolio.cashBalance - totalCost,
        holdings: updatedHoldings,
        transactions: [...currentPortfolio.transactions, transaction],
      });

      return null;
    },
    [updatePortfolio],
  );

  const sellAsset = useCallback(
    (assetId: string, amount: number): string | null => {
      if (amount <= 0) {
        return 'Sell amount must be greater than zero.';
      }

      const currentPortfolio = portfolioRef.current;
      const existingHolding = currentPortfolio.holdings.find(
        (holding) => holding.assetId === assetId,
      );

      if (existingHolding === undefined) {
        return 'You do not own this asset.';
      }

      if (existingHolding.amount < amount) {
        return 'You cannot sell more tokens than you own.';
      }

      const salePrice = existingHolding.averageBuyPrice;
      const totalSaleValue = salePrice * amount;
      const transaction = createTransaction(assetId, 'SELL', amount, salePrice);

      const updatedHoldings = currentPortfolio.holdings
        .map((holding) => {
          if (holding.assetId !== assetId) {
            return holding;
          }

          return {
            ...holding,
            amount: holding.amount - amount,
          };
        })
        .filter((holding) => holding.amount > 0);

      updatePortfolio({
        cashBalance: currentPortfolio.cashBalance + totalSaleValue,
        holdings: updatedHoldings,
        transactions: [...currentPortfolio.transactions, transaction],
      });

      return null;
    },
    [updatePortfolio],
  );

  const contextValue = useMemo<PortfolioContextValue>(
    () => ({
      ...portfolio,
      buyAsset,
      sellAsset,
    }),
    [buyAsset, portfolio, sellAsset],
  );

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);

  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider.');
  }

  return context;
}
