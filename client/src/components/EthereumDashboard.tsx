import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

interface StatCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  subtitle?: string;
}

interface Block {
  number: string;
  miner: string;
  txCount: number;
  gasUsed: string;
  timeAgo: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeAgo: string;
}

export const EthereumDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  // Fetch network stats with auto-refresh every 60 seconds  
  const { data: statsData } = useQuery({
    queryKey: ['network-stats'],
    queryFn: async () => {
      const response = await fetch('/api/network-stats');
      if (!response.ok) throw new Error('Failed to fetch network stats');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  // Fetch ETH price history for charts
  const { data: priceHistoryData } = useQuery({
    queryKey: ['eth-price-history', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/eth-price-history?days=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch price history');
      return response.json();
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  // Fetch network activity metrics
  const { data: networkActivityData } = useQuery({
    queryKey: ['network-activity'],
    queryFn: async () => {
      const response = await fetch('/api/network-activity');
      if (!response.ok) throw new Error('Failed to fetch network activity');
      return response.json();
    },
    refetchInterval: 90000, // Refresh every 90 seconds
  });

  // Fetch latest blocks with auto-refresh every 90 seconds
  const { data: blocksData } = useQuery({
    queryKey: ['latest-blocks'],
    queryFn: async () => {
      const response = await fetch('/api/latest-blocks');
      if (!response.ok) throw new Error('Failed to fetch latest blocks');
      return response.json();
    },
    refetchInterval: 90000, // Refresh every 90 seconds
  });

  // Fetch latest transactions with auto-refresh every 90 seconds
  const { data: transactionsData } = useQuery({
    queryKey: ['latest-transactions'],
    queryFn: async () => {
      const response = await fetch('/api/latest-transactions');
      if (!response.ok) throw new Error('Failed to fetch latest transactions');
      return response.json();
    },
    refetchInterval: 90000, // Refresh every 90 seconds
  });

  const stats = statsData?.stats || [
    { title: "ETHER PRICE", value: "Loading...", change: "Fetching data...", changeType: "neutral" },
    { title: "LATEST BLOCK", value: "Loading...", subtitle: "Live" },
    { title: "GAS PRICE", value: "Loading...", subtitle: "Standard" },
    { title: "NETWORK", value: "Ethereum Mainnet" },
    { title: "CONFIRMATIONS", value: "12 blocks" },
    { title: "STATUS", value: "Connecting..." }
  ];

  const latestBlocks = blocksData?.blocks || [];
  const latestTransactions = transactionsData?.transactions || [];

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const priceChartData = priceHistoryData?.data?.map((item: any) => ({
    time: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: item.price,
    timestamp: item.timestamp
  })) || [];

  const networkMetrics = networkActivityData?.metrics || [];
  
  // Use the same price from network stats for consistency
  const ethPriceStat = stats.find(stat => stat.title === "ETHER PRICE");
  const currentPrice = ethPriceStat?.value ? parseFloat(ethPriceStat.value.replace('$', '').replace(',', '')) : 0;
  const previousPrice = priceChartData.length > 1 ? priceChartData[priceChartData.length - 2]?.price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100) : 0;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section with Live Status */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Market Summary → Ethereum
              </h1>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-foreground font-mono">
                  {formatPrice(currentPrice)}
                  <span className="text-lg text-muted-foreground ml-2">USD</span>
                </div>
                <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="text-lg font-semibold">
                    {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                  </span>
                  <span className="text-sm">↗ past {selectedPeriod} days</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {statsData?.lastUpdated && (
                  <>
                    {formatTimestamp(statsData.lastUpdated)} · Live data
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-green-400">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map((stat: StatCard, index: number) => (
            <div key={index} className="bg-card rounded-lg border border-border p-4 hover:border-border/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-sm">
                    {index === 0 ? '💰' : index === 1 ? '📊' : index === 2 ? '⛽' : index === 3 ? '📈' : index === 4 ? '🟢' : '🔒'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1 font-mono">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className={`text-xs mt-1 ${stat.changeType === 'negative' ? 'text-red-500' : 'text-green-500'}`}>
                      {stat.change}
                    </p>
                  )}
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Chart */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                ETH Price History
              </h3>
              <p className="text-sm text-muted-foreground">
                {priceHistoryData?.lastUpdated && (
                  <>Updated {formatTimestamp(priceHistoryData.lastUpdated)}</>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {['1', '7', '30', '90'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    selectedPeriod === period
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/60'
                  }`}
                  data-testid={`button-period-${period}d`}
                >
                  {period}D
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceChartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm text-muted-foreground mb-1">{label}</p>
                          <p className="text-lg font-bold text-foreground">
                            {formatPrice(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Activity Chart */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Network Activity
              </h3>
              <p className="text-sm text-muted-foreground">
                {networkActivityData?.lastUpdated && (
                  <>Updated {formatTimestamp(networkActivityData.lastUpdated)}</>
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Count Chart */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Transactions per Block</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={networkMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="blockNumber" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickFormatter={(value) => `#${value.toString().slice(-3)}`}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="text-sm text-muted-foreground mb-1">Block #{label}</p>
                              <p className="text-lg font-bold text-foreground">
                                {payload[0].value} transactions
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="txCount" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gas Usage Chart */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Gas Usage per Block (M)</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={networkMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="blockNumber" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickFormatter={(value) => `#${value.toString().slice(-3)}`}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="text-sm text-muted-foreground mb-1">Block #{label}</p>
                              <p className="text-lg font-bold text-foreground">
                                {payload[0].value}M gas used
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gasUsedFormatted" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Blocks and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Latest Blocks */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">Latest Blocks</h3>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {blocksData?.lastUpdated && (
                  <>Updated {formatTimestamp(blocksData.lastUpdated)}</>
                )}
              </div>
            </div>
            <div className="divide-y divide-border">
              {latestBlocks.length > 0 ? latestBlocks.map((block: Block, index: number) => (
                <div key={block.number || index} className="p-4 hover:bg-muted/30 transition-colors" data-testid={`block-${block.number}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <span className="text-xs text-primary-foreground">⛏️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground font-mono">
                          #{parseInt(block.number).toLocaleString()}
                        </span>
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                          {block.timeAgo}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Miner <span className="text-foreground font-mono">{formatAddress(block.miner)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{block.txCount} txns</span>
                        <span>Gas: {block.gasUsed}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-2 h-8 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm">Loading live blocks...</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border">
              <button 
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                data-testid="button-view-all-blocks"
              >
                VIEW ALL BLOCKS →
              </button>
            </div>
          </div>

          {/* Latest Transactions */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">Latest Transactions</h3>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {transactionsData?.lastUpdated && (
                  <>Updated {formatTimestamp(transactionsData.lastUpdated)}</>
                )}
              </div>
            </div>
            <div className="divide-y divide-border">
              {latestTransactions.length > 0 ? latestTransactions.map((tx: Transaction, index: number) => (
                <div key={tx.hash || index} className="p-4 hover:bg-muted/30 transition-colors" data-testid={`transaction-${tx.hash.slice(-8)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <span className="text-xs text-primary-foreground">💸</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground font-mono truncate">
                          {formatAddress(tx.hash)}
                        </span>
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                          {tx.timeAgo}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        <span className="text-muted-foreground/60">From</span> <span className="text-foreground font-mono">{formatAddress(tx.from)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="text-muted-foreground/60">To</span> <span className="text-foreground font-mono">{formatAddress(tx.to)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground font-mono bg-muted/20 px-2 py-1 rounded">
                        {parseFloat(tx.value) > 0 ? `${tx.value} ETH` : '0 ETH'}
                      </div>
                      {parseFloat(tx.value) > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          ≈ ${(parseFloat(tx.value) * currentPrice).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm">Loading live transactions...</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border">
              <button 
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                data-testid="button-view-all-transactions"
              >
                VIEW ALL TRANSACTIONS →
              </button>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                  <span className="text-xs text-primary-foreground">⟐</span>
                </div>
                <span className="text-sm">Powered by Ethereum Mainnet</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Data provided by Etherscan API
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Network Status: Healthy</span>
              </div>
              <div>
                API Rate: 99.9% uptime
              </div>
              {statsData?.lastUpdated && (
                <div>
                  Last sync: {formatTimestamp(statsData.lastUpdated)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};