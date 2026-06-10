import { useMemo, useState, type FormEvent } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useCryptoData } from '../hooks/useCryptoData';
import type { Transaction } from '../types/crypto';

type TradeMode = Transaction['type'];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function TradingPanel() {
  const { data, loading, error: marketError } = useCryptoData();
  const { buyAsset, holdings, sellAsset } = usePortfolio();
  const [mode, setMode] = useState<TradeMode>('BUY');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const selectedAsset = useMemo(
    () => data.find((asset) => asset.id === selectedAssetId),
    [data, selectedAssetId],
  );

  const selectedHolding = useMemo(
    () => holdings.find((holding) => holding.assetId === selectedAssetId),
    [holdings, selectedAssetId],
  );

  const parsedAmount = Number(amount);
  const estimatedValue =
    selectedAsset !== undefined && Number.isFinite(parsedAmount)
      ? selectedAsset.current_price * parsedAmount
      : 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedAssetId.length === 0) {
      setIsSuccess(false);
      setTradeMessage('Choose an asset before placing a trade.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setIsSuccess(false);
      setTradeMessage('Enter an amount greater than zero.');
      return;
    }

    const result =
      mode === 'BUY'
        ? selectedAsset === undefined
          ? 'Selected asset price is not available.'
          : buyAsset(selectedAsset, parsedAmount)
        : sellAsset(selectedAssetId, parsedAmount);

    if (result !== null) {
      setIsSuccess(false);
      setTradeMessage(result);
      return;
    }

    setIsSuccess(true);
    setTradeMessage(`${mode === 'BUY' ? 'Bought' : 'Sold'} successfully.`);
    setAmount('');
  }

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950 p-4 shadow-2xl shadow-black/30">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Trade
        </h2>
      </div>

      <div className="mb-4 grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.03] p-1">
        {(['BUY', 'SELL'] as const).map((tab) => (
          <button
            className={
              mode === tab
                ? 'rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950'
                : 'rounded-md px-3 py-2 text-sm font-semibold text-zinc-400 hover:text-white'
            }
            key={tab}
            onClick={() => {
              setMode(tab);
              setTradeMessage(null);
            }}
            type="button"
          >
            {tab === 'BUY' ? 'Buy' : 'Sell'}
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Asset
          </span>
          <select
            className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
            disabled={loading}
            onChange={(event) => setSelectedAssetId(event.target.value)}
            value={selectedAssetId}
          >
            <option value="">Select coin</option>
            {data.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Amount
          </span>
          <input
            className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400"
            min="0"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            step="0.000001"
            type="number"
            value={amount}
          />
        </label>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Estimated value</span>
            <span className="font-medium text-white">
              {currencyFormatter.format(estimatedValue)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-zinc-400">
            <span>Owned</span>
            <span className="font-medium text-white">
              {selectedHolding?.amount.toFixed(6) ?? '0.000000'}
            </span>
          </div>
        </div>

        {(marketError !== null || tradeMessage !== null) && (
          <p
            className={
              isSuccess
                ? 'rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300'
                : 'rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300'
            }
          >
            {tradeMessage ?? marketError}
          </p>
        )}

        <button
          className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          disabled={loading || selectedAssetId.length === 0}
          type="submit"
        >
          {mode === 'BUY' ? 'Buy asset' : 'Sell asset'}
        </button>
      </form>
    </section>
  );
}
