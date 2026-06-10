import { AssetList } from './components/AssetList';
import { Navbar } from './components/Navbar';
import { PortfolioTable } from './components/PortfolioTable';
import { TradingPanel } from './components/TradingPanel';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AssetList />
          <PortfolioTable />
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <TradingPanel />
        </div>
      </main>
    </div>
  );
}
