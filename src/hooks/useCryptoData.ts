import { useEffect, useState } from 'react';
import type { CryptoAsset } from '../types/crypto';

declare global {
  interface ImportMetaEnv {
    readonly VITE_COINGECKO_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const COINGECKO_MARKETS_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCryptoAsset(value: unknown): value is CryptoAsset {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.symbol === 'string' &&
    typeof value.name === 'string' &&
    typeof value.current_price === 'number' &&
    typeof value.price_change_percentage_24h === 'number' &&
    typeof value.image === 'string' &&
    typeof value.high_24h === 'number' &&
    typeof value.low_24h === 'number'
  );
}

function isCryptoAssetArray(value: unknown): value is CryptoAsset[] {
  return Array.isArray(value) && value.every(isCryptoAsset);
}

interface UseCryptoDataResult {
  data: CryptoAsset[];
  loading: boolean;
  error: string | null;
}

export function useCryptoData(): UseCryptoDataResult {
  const [data, setData] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCryptoData() {
      const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(COINGECKO_MARKETS_URL, {
          headers: {
            'x-cg-demo-api-key': apiKey,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`CoinGecko request failed: ${response.status}`);
        }

        const responseData = (await response.json()) as unknown;

        if (!isCryptoAssetArray(responseData)) {
          throw new Error('CoinGecko returned an unexpected response shape.');
        }

        setData(responseData);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to load crypto data.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchCryptoData();

    return () => {
      controller.abort();
    };
  }, []);

  return { data, loading, error };
}
