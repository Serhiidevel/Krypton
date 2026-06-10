import { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function Navbar() {
  const { cashBalance, holdings } = usePortfolio();

  const totalPortfolioValue = useMemo(() => {
    const holdingsValue = holdings.reduce(
      (total, holding) => total + holding.amount * holding.averageBuyPrice,
      0,
    );

    return cashBalance + holdingsValue;
  }, [cashBalance, holdings]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-lg font-black text-zinc-950">
            K
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Krypton</p>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Paper trading
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-80">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-zinc-500">Portfolio value</p>
            <p className="mt-1 text-base font-semibold text-white">
              {currencyFormatter.format(totalPortfolioValue)}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-zinc-500">Cash balance</p>
            <p className="mt-1 text-base font-semibold text-emerald-400">
              {currencyFormatter.format(cashBalance)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
