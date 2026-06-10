import { useCryptoData } from '../hooks/useCryptoData';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function AssetList() {
  const { data, loading, error } = useCryptoData();

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950 p-4 shadow-2xl shadow-black/30">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Market
        </h2>
        <span className="text-xs text-zinc-500">Top 10</span>
      </div>

      {error !== null && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              className="flex animate-pulse items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
              key={index}
            >
              <div className="h-9 w-9 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded bg-zinc-800" />
                <div className="h-3 w-16 rounded bg-zinc-800" />
              </div>
              <div className="h-4 w-20 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((asset) => {
            const isPositive = asset.price_change_percentage_24h >= 0;

            return (
              <div
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.06]"
                key={asset.id}
              >
                <img
                  alt={asset.name}
                  className="h-9 w-9 rounded-full"
                  src={asset.image}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {asset.name}
                  </p>
                  <p className="text-xs uppercase text-zinc-500">
                    {asset.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {currencyFormatter.format(asset.current_price)}
                  </p>
                  <p
                    className={
                      isPositive
                        ? 'text-xs font-medium text-green-500'
                        : 'text-xs font-medium text-red-500'
                    }
                  >
                    {isPositive ? '+' : ''}
                    {percentFormatter.format(asset.price_change_percentage_24h)}
                    %
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
