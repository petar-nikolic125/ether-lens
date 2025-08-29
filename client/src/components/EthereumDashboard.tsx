import React, { useState, useEffect } from 'react';

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
  reward: string;
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
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: "ETHER PRICE",
      value: "$4,343.44",
      change: "0.040749 BTC (-1.18%)",
      changeType: "negative"
    },
    {
      title: "TRANSACTIONS",
      value: "2,966.43 M",
      subtitle: "(20.0 TPS)"
    },
    {
      title: "MED GAS PRICE",
      value: "0.308 Gwei",
      subtitle: "($0.05)"
    },
    {
      title: "MARKET CAP",
      value: "$526,696,481,689.00"
    },
    {
      title: "LAST FINALIZED BLOCK",
      value: "23249569"
    },
    {
      title: "LAST SAFE BLOCK",
      value: "23249701"
    }
  ]);

  const [latestBlocks, setLatestBlocks] = useState<Block[]>([
    {
      number: "23249745",
      miner: "Builder0x69",
      txCount: 159,
      gasUsed: "0.009556 Eth",
      reward: "17 secs ago",
      timeAgo: "17 secs ago"
    },
    {
      number: "23249744",
      miner: "Titan Builder",
      txCount: 189,
      gasUsed: "0.009564 Eth",
      reward: "29 secs ago",
      timeAgo: "29 secs ago"
    },
    {
      number: "23249743",
      miner: "Titan Builder",
      txCount: 290,
      gasUsed: "0.011446 Eth",
      reward: "41 secs ago",
      timeAgo: "41 secs ago"
    },
    {
      number: "23249742",
      miner: "MEV Builder: 0x88...",
      txCount: 87,
      gasUsed: "0.004536 Eth",
      reward: "53 secs ago",
      timeAgo: "53 secs ago"
    },
    {
      number: "23249741",
      miner: "beaverbuild",
      txCount: 390,
      gasUsed: "0.007556 Eth",
      reward: "1 min ago",
      timeAgo: "1 min ago"
    },
    {
      number: "23249740",
      miner: "Titan Builder",
      txCount: 328,
      gasUsed: "0.013382 Eth",
      reward: "1 min ago",
      timeAgo: "1 min ago"
    }
  ]);

  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([
    {
      hash: "0xfae5f40db25a...24f783711",
      from: "0xda60d94588e4...5107821657",
      to: "0xd0CE8E3E1d5...9f9C40C07",
      value: "0.008677 Eth",
      timeAgo: "17 secs ago"
    },
    {
      hash: "0x943b3b06de0...24f783711",
      from: "0xda60d94588e4...5107821657",
      to: "0xd0CE8E8426...9f9C40C07",
      value: "0.003333 Eth",
      timeAgo: "17 secs ago"
    },
    {
      hash: "0x11ad610f7f6...CFC4fae0f",
      from: "0xda60d94588e4...24f783711",
      to: "0xe71a93a27...CFC4fae0f",
      value: "0.002564 Eth",
      timeAgo: "17 secs ago"
    },
    {
      hash: "0x80051541f...4b835227A7",
      from: "0xda60d94588e4...24f783711",
      to: "0x01616e9a0...4b835227A7",
      value: "0.000095 Eth",
      timeAgo: "17 secs ago"
    },
    {
      hash: "0x6c2a5ea06ff...5275c5892",
      from: "0xf4903Ce6...5a6f0203b5",
      to: "0x67D1536E8...5275c5892",
      value: "0.007919 Eth",
      timeAgo: "17 secs ago"
    },
    {
      hash: "0x024de4243...0c2252C490",
      from: "0xf5F906EF2...c726bc597",
      to: "0x50F31855...0c2252C490",
      value: "0.000091 Eth",
      timeAgo: "17 secs ago"
    }
  ]);

  return (
    <div className="bg-background min-h-screen">
      {/* Statistics Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => (
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
              <h3 className="text-lg font-semibold text-foreground">Latest Blocks</h3>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ⚙️ Customize
              </button>
            </div>
            <div className="divide-y divide-border">
              {latestBlocks.map((block, index) => (
                <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground font-mono">
                          {block.number}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {block.timeAgo}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Miner <span className="text-foreground">{block.miner}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {block.txCount} txns in 12 secs
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground font-mono">
                        {block.gasUsed}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              <h3 className="text-lg font-semibold text-foreground">Latest Transactions</h3>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ⚙️ Customize
              </button>
            </div>
            <div className="divide-y divide-border">
              {latestTransactions.map((tx, index) => (
                <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">📄</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground font-mono truncate">
                          {tx.hash}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tx.timeAgo}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        From <span className="text-foreground font-mono">{tx.from}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        To <span className="text-foreground font-mono">{tx.to}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground font-mono">
                        {tx.value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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