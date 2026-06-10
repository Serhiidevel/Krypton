import { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useCryptoData } from '../hooks/useCryptoData';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function PortfolioTable() {
  const { holdings, transactions } = usePortfolio();
  const { data } = useCryptoData();

  const assetsById = useMemo(
    () => new Map(data.map((asset) => [asset.id, asset])),
    [data],
  );

  const totalProfitLoss = holdings.reduce((total, holding) => {
    const marketPrice =
      assetsById.get(holding.assetId)?.current_price ?? holding.averageBuyPrice;
    const costBasis = holding.amount * holding.averageBuyPrice;
    const currentValue = holding.amount * marketPrice;

    return total + currentValue - costBasis;
  }, 0);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-zinc-950 p-4 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Holdings
          </h2>
          <span
            className={
              totalProfitLoss >= 0
                ? 'text-sm font-semibold text-green-500'
                : 'text-sm font-semibold text-red-500'
            }
          >
            P/L {currencyFormatter.format(totalProfitLoss)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Avg buy</th>
                <th className="pb-3 font-medium">Market</th>
                <th className="pb-3 font-medium">Value</th>
                <th className="pb-3 font-medium">P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {holdings.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-zinc-500" colSpan={6}>
                    No holdings yet.
                  </td>
                </tr>
              ) : (
                holdings.map((holding) => {
                  const marketPrice =
                    assetsById.get(holding.assetId)?.current_price ??
                    holding.averageBuyPrice;
                  const currentValue = holding.amount * marketPrice;
                  const costBasis = holding.amount * holding.averageBuyPrice;
                  const profitLoss = currentValue - costBasis;

                  return (
                    <tr key={holding.assetId}>
                      <td className="py-4">
                        <p className="font-medium text-white">{holding.name}</p>
                        <p className="text-xs uppercase text-zinc-500">
                          {holding.symbol}
                        </p>
                      </td>
                      <td className="py-4 text-zinc-300">
                        {numberFormatter.format(holding.amount)}
                      </td>
                      <td className="py-4 text-zinc-300">
                        {currencyFormatter.format(holding.averageBuyPrice)}
                      </td>
                      <td className="py-4 text-zinc-300">
                        {currencyFormatter.format(marketPrice)}
                      </td>
                      <td className="py-4 text-white">
                        {currencyFormatter.format(currentValue)}
                      </td>
                      <td
                        className={
                          profitLoss >= 0
                            ? 'py-4 font-medium text-green-500'
                            : 'py-4 font-medium text-red-500'
                        }
                      >
                        {currencyFormatter.format(profitLoss)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-zinc-950 p-4 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Transactions
          </h2>
          <span className="text-xs text-zinc-500">{transactions.length}</span>
        </div>

        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-zinc-500">
              No transactions yet.
            </p>
          ) : (
            [...transactions].reverse().map((transaction) => (
              <div
                className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[80px_1fr_auto] sm:items-center"
                key={transaction.id}
              >
                <span
                  className={
                    transaction.type === 'BUY'
                      ? 'w-fit rounded-md bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500'
                      : 'w-fit rounded-md bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-500'
                  }
                >
                  {transaction.type}
                </span>
                <div>
                  <p className="text-sm text-white">{transaction.assetId}</p>
                  <p className="text-xs text-zinc-500">
                    {dateFormatter.format(transaction.timestamp)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-white">
                    {numberFormatter.format(transaction.amount)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {currencyFormatter.format(transaction.price)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
