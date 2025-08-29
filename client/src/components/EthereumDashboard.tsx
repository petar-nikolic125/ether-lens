import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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
  // Fetch network stats with auto-refresh every 30 seconds
  const { data: statsData } = useQuery({
    queryKey: ['network-stats'],
    queryFn: async () => {
      const response = await fetch('/api/network-stats');
      if (!response.ok) throw new Error('Failed to fetch network stats');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch latest blocks with auto-refresh every 15 seconds
  const { data: blocksData } = useQuery({
    queryKey: ['latest-blocks'],
    queryFn: async () => {
      const response = await fetch('/api/latest-blocks');
      if (!response.ok) throw new Error('Failed to fetch latest blocks');
      return response.json();
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch latest transactions with auto-refresh every 15 seconds
  const { data: transactionsData } = useQuery({
    queryKey: ['latest-transactions'],
    queryFn: async () => {
      const response = await fetch('/api/latest-transactions');
      if (!response.ok) throw new Error('Failed to fetch latest transactions');
      return response.json();
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const stats = statsData?.stats || [
    { title: "LOADING...", value: "Fetching live data..." },
    { title: "NETWORK", value: "Ethereum Mainnet" },
    { title: "STATUS", value: "Connecting..." },
    { title: "API", value: "Etherscan" },
    { title: "REFRESH", value: "Auto 30s" },
    { title: "DATA", value: "Real-time" }
  ];

  const latestBlocks = blocksData?.blocks || [];
  const latestTransactions = transactionsData?.transactions || [];

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="bg-background min-h-screen">
      {/* Statistics Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Transaction History Chart Placeholder */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            TRANSACTION HISTORY IN 14 DAYS
          </h3>
          <div className="h-32 bg-gradient-to-r from-origin-purple/20 to-origin-cyan/20 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">Chart visualization area</span>
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
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                🔄 Auto-refresh 15s
              </button>
            </div>
            <div className="divide-y divide-border">
              {latestBlocks.length > 0 ? latestBlocks.map((block: Block, index: number) => (
                <div key={block.number || index} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <span className="text-xs text-primary-foreground">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground font-mono">
                          {parseInt(block.number).toLocaleString()}
                        </span>
                        <span className="text-xs text-green-400">
                          {block.timeAgo}
                        </span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Miner <span className="text-foreground">{formatAddress(block.miner)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {block.txCount} txns in block
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground font-mono">
                        {block.gasUsed} ETH
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading live blocks...
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border">
              <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
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
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                🔄 Auto-refresh 15s
              </button>
            </div>
            <div className="divide-y divide-border">
              {latestTransactions.length > 0 ? latestTransactions.map((tx: Transaction, index: number) => (
                <div key={tx.hash || index} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <span className="text-xs text-primary-foreground">📄</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground font-mono truncate">
                          {formatAddress(tx.hash)}
                        </span>
                        <span className="text-xs text-green-400">
                          {tx.timeAgo}
                        </span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        From <span className="text-foreground font-mono">{formatAddress(tx.from)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        To <span className="text-foreground font-mono">{formatAddress(tx.to)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground font-mono">
                        {tx.value} ETH
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading live transactions...
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border">
              <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                VIEW ALL TRANSACTIONS →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
              <span className="text-xs text-primary-foreground">⟐</span>
            </div>
            <span className="text-sm">Powered by Ethereum</span>
          </div>
        </div>
      </div>
    </div>
  );
};