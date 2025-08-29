import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Wallet, Clock, TrendingUp, Activity } from "lucide-react";

interface StatsGridProps {
  address: string;
  startBlock: string;
}

export const StatsGrid = ({ address, startBlock }: StatsGridProps) => {
  // Mock data — replace with API data in real app
  const stats = {
    totalTransactions: 1247,
    incomingTxns: 632,
    outgoingTxns: 615,
    totalVolume: 45.67,
    currentBalance: 12.34,
    firstActivity: "2021-03-15",
    lastActivity: "2024-01-15",
  };

  const usd = (n: number) =>
      new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

  const daysActive = Math.floor(
      (new Date().getTime() - new Date(stats.firstActivity).getTime()) / (1000 * 60 * 60 * 24)
  );

  const incomingPct = (stats.incomingTxns / stats.totalTransactions) * 100;
  const outgoingPct = (stats.outgoingTxns / stats.totalTransactions) * 100;

  return (
      <div className="mb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center neural-glow animate-glow bg-gradient-primary">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl font-bold font-space ot-gradient-text">Neural Wallet Analysis</h2>
              <p className="text-muted-foreground font-inter">Comprehensive blockchain intelligence</p>
            </div>
          </div>
          <Badge
              variant="secondary"
              className="font-mono text-sm px-4 py-2 bg-secondary/20 border-border/30 ot-border-gradient"
              title={address}
          >
            {address.slice(0, 8)}...{address.slice(-6)}
          </Badge>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Transactions */}
          <div className="ot-card-glass hover-lift group relative overflow-hidden ot-border-gradient">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-origin-purple/10 to-origin-purple/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground font-space">Total Transactions</div>
                <Activity className="w-4 h-4 text-origin-purple" />
              </div>
              <div className="text-3xl font-bold mb-1 font-space">{stats.totalTransactions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Since block {Number(startBlock).toLocaleString()}</div>
            </div>
          </div>

          {/* Incoming */}
          <div className="ot-card-glass hover-lift group relative overflow-hidden ot-border-gradient">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-origin-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground font-space">Incoming</div>
                <ArrowDownLeft className="w-4 h-4 text-origin-teal" />
              </div>
              <div className="text-3xl font-bold mb-1 font-space">{stats.incomingTxns.toLocaleString()}</div>
              <div className="text-sm text-origin-teal font-medium">+{incomingPct.toFixed(1)}%</div>
            </div>
          </div>

          {/* Outgoing */}
          <div className="ot-card-glass hover-lift group relative overflow-hidden ot-border-gradient">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-chart-5/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground font-space">Outgoing</div>
                <ArrowUpRight className="w-4 h-4 text-chart-5" />
              </div>
              <div className="text-3xl font-bold mb-1 font-space">{stats.outgoingTxns.toLocaleString()}</div>
              <div className="text-sm text-chart-5 font-medium">-{outgoingPct.toFixed(1)}%</div>
            </div>
          </div>

          {/* Current Balance */}
          <div className="ot-card-glass hover-lift group relative overflow-hidden ot-border-gradient">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-origin-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground font-space">Current Balance</div>
                <div className="text-xs bg-origin-cyan/20 text-origin-cyan px-2 py-1 rounded-lg font-space">ETH</div>
              </div>
              <div className="text-3xl font-bold mb-1 font-space">{stats.currentBalance}</div>
              <div className="text-sm text-muted-foreground">
                ≈ {usd(stats.currentBalance * 4352.33)}
              </div>
            </div>
          </div>
        </div>

        {/* Extended cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Volume */}
          <div className="ot-card-glass hover-lift relative overflow-hidden ot-border-gradient">
            <div className="absolute inset-0 bg-gradient-neural opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-origin-purple" />
                <div className="text-sm text-muted-foreground font-space">Total Volume Processed</div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-4xl font-bold font-space">{stats.totalVolume}</div>
                <div className="text-lg text-origin-purple font-space">ETH</div>
              </div>
              <div className="text-muted-foreground">≈ {usd(stats.totalVolume * 4352.33)}</div>
            </div>
          </div>

          {/* Activity period */}
          <div className="ot-card-glass hover-lift relative overflow-hidden ot-border-gradient">
            <div className="absolute inset-0 bg-gradient-glass opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-origin-cyan" />
                <div className="text-sm text-muted-foreground font-space">Activity Timeline</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold font-space">First Activity</div>
                    <div className="text-muted-foreground font-inter">{stats.firstActivity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold font-space">Last Activity</div>
                    <div className="text-muted-foreground font-inter">{stats.lastActivity}</div>
                  </div>
                </div>

                <div className="relative mt-2">
                  <div className="h-2 rounded-full bg-secondary/40">
                    <div
                        className="h-2 rounded-full bg-gradient-primary"
                        style={{ width: "100%" }}
                        aria-hidden
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground mt-3 font-space">
                    {daysActive} days of neural activity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
