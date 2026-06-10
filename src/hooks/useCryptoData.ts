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

let cachedCryptoAssets: CryptoAsset[] | null = null;
let cryptoAssetsRequest: Promise<CryptoAsset[]> | null = null;

async function fetchCryptoAssets(): Promise<CryptoAsset[]> {
  if (cachedCryptoAssets !== null) {
    return cachedCryptoAssets;
  }

  if (cryptoAssetsRequest !== null) {
    return cryptoAssetsRequest;
  }

  cryptoAssetsRequest = (async () => {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;

    const response = await fetch(COINGECKO_MARKETS_URL, {
      headers: {
        'x-cg-demo-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko request failed: ${response.status}`);
    }

    const responseData = (await response.json()) as unknown;

    if (!isCryptoAssetArray(responseData)) {
      throw new Error('CoinGecko returned an unexpected response shape.');
    }

    cachedCryptoAssets = responseData;
    return responseData;
  })();

  try {
    return await cryptoAssetsRequest;
  } finally {
    cryptoAssetsRequest = null;
  }
}

export function useCryptoData(): UseCryptoDataResult {
  const [data, setData] = useState<CryptoAsset[]>(cachedCryptoAssets ?? []);
  const [loading, setLoading] = useState<boolean>(cachedCryptoAssets === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadCryptoData() {
      setLoading(true);
      setError(null);

      try {
        const assets = await fetchCryptoAssets();

        if (isActive) {
          setData(assets);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Failed to load crypto data.',
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadCryptoData();

    return () => {
      isActive = false;
    };
  }, []);

  return { data, loading, error };
}
