import React from "react";

interface PortfolioCardProps {
  totalValue: number;
  assetCount: number;
  change24h: number;
}

interface EurBalanceCardProps {
  balance: number;
  inOrders: number;
  onRefresh: () => void;
}

interface TopCoinCardProps {
  symbol: string;
  amount: number;
  inOrders: number;
  eurValue: number;
}

function PortfolioCard({ totalValue, assetCount, change24h }: PortfolioCardProps) {
  return (
    <div className="bg-[#2B2F36] rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-300 text-lg font-medium">Portfolio Value</h2>
        <span className={`text-xl ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change24h >= 0 ? '↗' : '↘'}
        </span>
      </div>
      <div className="text-3xl font-bold text-green-500 mb-2">
        €{totalValue.toFixed(2)}
      </div>
      <div className="text-gray-400 text-sm">
        {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
      </div>
    </div>
  );
}

function EurBalanceCard({ balance, inOrders, onRefresh }: EurBalanceCardProps) {
  return (
    <div className="bg-[#2B2F36] rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-300 text-lg font-medium">EUR Balance</h2>
        <button 
          onClick={onRefresh}
          className="text-gray-400 hover:text-gray-300 transition-colors"
          aria-label="Refresh balance"
        >
          ↻
        </button>
      </div>
      <div className="text-3xl font-bold text-blue-500 mb-2">
        €{balance.toFixed(2)}
      </div>
      <div className="text-gray-400 text-sm">
        In orders: €{inOrders.toFixed(2)}
      </div>
    </div>
  );
}

function TopCoinCard({ symbol, amount, inOrders, eurValue }: TopCoinCardProps) {
  return (
    <div className="bg-[#2B2F36] rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-300 text-lg font-medium">{symbol}</h2>
        <span className="text-gray-400">📈</span>
      </div>
      <div className="text-3xl font-bold text-purple-500 mb-2">
        {amount.toFixed(8)} {symbol}
      </div>
      <div className="text-gray-400 text-sm flex justify-between items-center">
        <span>€{eurValue.toFixed(2)}</span>
        {inOrders > 0 && (
          <span>In orders: {inOrders.toFixed(8)} {symbol}</span>
        )}
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  // Example data - will be replaced with real data later
  const mockData = {
    portfolio: {
      totalValue: 0.00,
      assetCount: 0,
      change24h: 0,
    },
    eurBalance: {
      balance: 0.00,
      inOrders: 0.00,
    },
    topCoin: {
      symbol: "BTC",
      amount: 0,
      inOrders: 0,
      eurValue: 0.00,
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PortfolioCard 
          totalValue={mockData.portfolio.totalValue}
          assetCount={mockData.portfolio.assetCount}
          change24h={mockData.portfolio.change24h}
        />
        <EurBalanceCard 
          balance={mockData.eurBalance.balance}
          inOrders={mockData.eurBalance.inOrders}
          onRefresh={() => console.log('Refreshing balance...')}
        />
        <TopCoinCard 
          symbol={mockData.topCoin.symbol}
          amount={mockData.topCoin.amount}
          inOrders={mockData.topCoin.inOrders}
          eurValue={mockData.topCoin.eurValue}
        />
      </div>
    </div>
  );
}