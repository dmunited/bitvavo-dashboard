import React from "react";

// Component 1: Portfolio Value Card
function PortfolioValueCard({ totalValue, change24h, assetCount }) {
  // Format numbers: ensure two decimals for currency and percentage
  const formattedTotal = `€${totalValue.toFixed(2)}`;
  const formattedChange = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow">
      {/* Card Header: Title and trend icon */}
      <div className="flex justify-between items-start">
        <h2 className="text-slate-200 font-semibold">Portfolio Waarde</h2>
        {/* Trend indicator icon, green if positive or zero, red if negative */}
        <span className={`text-xl ${change24h >= 0 ? 'text-green-400' : 'text-red-500'}`}>
          {change24h >= 0 ? '↗️' : '↘️'}
        </span>
      </div>
      {/* Main Value */}
      <p className="mt-1 text-2xl font-bold text-green-400">{formattedTotal}</p>
      {/* Subtext: asset count and 24h change */}
      <p className="text-sm text-slate-400">
        {assetCount} {assetCount === 1 ? 'asset' : 'assets'}, {formattedChange} laatste 24u
      </p>
    </div>
  );
}

// Component 2: EUR Balance Card
function EurBalanceCard({ eurBalance, eurInOrders, onRefresh }) {
  // Format balances to two decimals
  const formattedBalance = `€${eurBalance.toFixed(2)}`;
  const formattedInOrders = `€${eurInOrders.toFixed(2)}`;
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow">
      {/* Card Header: Title and refresh button */}
      <div className="flex justify-between items-start">
        <h2 className="text-slate-200 font-semibold">EUR Saldo</h2>
        <button 
          type="button" 
          onClick={onRefresh} 
          className="text-slate-400 hover:text-slate-200"
          aria-label="Refresh balance"
        >
          ↻
        </button>
      </div>
      {/* Main EUR balance */}
      <p className="mt-1 text-2xl font-bold text-indigo-500">{formattedBalance}</p>
      {/* Subtext: in orders balance */}
      <p className="text-sm text-indigo-500/75">In orders: {formattedInOrders}</p>
    </div>
  );
}

// Subcomponent: single coin row
function CoinBalanceRow({ symbol, available, inOrders, totalEurValue }) {
  // Format numbers (coins could have varying decimals, here we use up to 8 for crypto, and 2 for EUR)
  const formattedAvailable = `${available}${symbol}`;  // e.g. "0.500BTC"
  const formattedInOrders = `${inOrders}${symbol}`;    // e.g. "0.100BTC"
  const formattedTotalEur = `€${totalEurValue.toFixed(2)}`;
  return (
    <li className="py-2 flex flex-col">
      {/* Top line: coin symbol and total EUR value */}
      <div className="flex justify-between">
        <span className="font-medium text-slate-200">{symbol}</span>
        <span className="font-medium text-slate-200">{formattedTotalEur}</span>
      </div>
      {/* Second line: available and in-orders amounts (if any) */}
      <div className="flex justify-between text-xs text-slate-400 mt-0.5">
        <span>{available.toFixed(8)} {symbol} beschikbaar</span>
        {inOrders > 0 ? (
          <span>{inOrders.toFixed(8)} {symbol} in orders</span>
        ) : (
          <span />  /* empty span to preserve structure if needed */
        )}
      </div>
    </li>
  );
}

// Component 3: Coin Balances Grid
function CoinBalancesGrid({ coins }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow">
      {/* We can include a heading here if desired:
      <h2 className="text-slate-200 font-semibold mb-2">Coin Balances</h2> 
      */}
      {coins.length > 0 ? (
        <ul className="divide-y divide-gray-700">
          {coins.map((coin) => (
            <CoinBalanceRow key={coin.symbol}
              symbol={coin.symbol}
              available={coin.available}
              inOrders={coin.inOrders}
              totalEurValue={coin.totalEurValue}
            />
          ))}
        </ul>
      ) : (
        <p className="text-center text-slate-400">Geen assets om weer te geven</p>
      )}
    </div>
  );
}

// Example usage of the components in a Dashboard page/component
export default function DashboardOverview() {
  // Dummy data ter demonstratie; in de echte app komen deze waarden dynamisch uit API/props
  const dummyPortfolioValue = 23000.00;
  const dummyChange24h = 2.50;
  const dummyAssetsCount = 2;
  const dummyEurBalance = 1500.00;
  const dummyEurInOrders = 200.00;
  const dummyCoins = [
    { symbol: "BTC", available: 0.50000000, inOrders: 0.10000000, totalEurValue: 20000.00 },
    { symbol: "ETH", available: 2.00000000, inOrders: 0.00000000, totalEurValue: 3000.00 }
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Top section: two cards side by side on md+, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PortfolioValueCard 
          totalValue={dummyPortfolioValue} 
          change24h={dummyChange24h} 
          assetCount={dummyAssetsCount} 
        />
        <EurBalanceCard 
          eurBalance={dummyEurBalance} 
          eurInOrders={dummyEurInOrders} 
          onRefresh={() => {
            // Hier zou de logica komen om balans te verversen, bv. refetch van API
            console.log("Refresh EUR balance");
          }} 
        />
      </div>
      {/* Bottom section: coin balances list */}
      <CoinBalancesGrid coins={dummyCoins} />
    </div>
  );
}
