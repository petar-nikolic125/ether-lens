import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Wallet, Clock } from "lucide-react";

interface StatsGridProps {
  address: string;
  startBlock: string;
}

export const StatsGrid = ({ address, startBlock }: StatsGridProps) => {
  // Mock data - in real app this would come from API
  const stats = {
    totalTransactions: 1247,
    incomingTxns: 632,
    outgoingTxns: 615,
    totalVolume: 45.67,
    currentBalance: 12.34,
    firstActivity: "2021-03-15",
    lastActivity: "2024-01-15",
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-ethereum" />
          <h2 className="text-2xl font-bold">Wallet Analysis</h2>
        </div>
        <Badge variant="secondary" className="font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Transactions */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Total Transactions</div>
              <div className="w-2 h-2 bg-ethereum rounded-full animate-pulse" />
            </div>
            <div className="text-3xl font-bold mb-2">{stats.totalTransactions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              Since block {Number(startBlock).toLocaleString()}
            </div>
          </div>
        </Card>

        {/* Incoming Transactions */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Incoming</div>
              <ArrowDownLeft className="w-4 h-4 text-chart-3" />
            </div>
            <div className="text-3xl font-bold mb-2">{stats.incomingTxns.toLocaleString()}</div>
            <div className="text-sm text-chart-3">
              +{((stats.incomingTxns / stats.totalTransactions) * 100).toFixed(1)}%
            </div>
          </div>
        </Card>

        {/* Outgoing Transactions */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Outgoing</div>
              <ArrowUpRight className="w-4 h-4 text-chart-5" />
            </div>
            <div className="text-3xl font-bold mb-2">{stats.outgoingTxns.toLocaleString()}</div>
            <div className="text-sm text-chart-5">
              -{((stats.outgoingTxns / stats.totalTransactions) * 100).toFixed(1)}%
            </div>
          </div>
        </Card>

        {/* Current Balance */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Current Balance</div>
              <div className="text-xs bg-chart-2/20 text-chart-2 px-2 py-1 rounded">ETH</div>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.currentBalance}</div>
            <div className="text-sm text-muted-foreground">
              ≈ ${(stats.currentBalance * 4352.33).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </Card>

        {/* Total Volume */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Total Volume</div>
              <div className="text-xs bg-ethereum/20 text-ethereum px-2 py-1 rounded">ETH</div>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.totalVolume}</div>
            <div className="text-sm text-muted-foreground">
              ≈ ${(stats.totalVolume * 4352.33).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </Card>

        {/* Activity Period */}
        <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card md:col-span-2 lg:col-span-3">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Activity Period</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">First Activity</div>
                <div className="text-muted-foreground">{stats.firstActivity}</div>
              </div>
              <div className="flex-1 mx-8">
                <div className="h-1 bg-gradient-primary rounded-full relative">
                  <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulse" />
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  {Math.floor((new Date().getTime() - new Date(stats.firstActivity).getTime()) / (1000 * 60 * 60 * 24))} days active
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">Last Activity</div>
                <div className="text-muted-foreground">{stats.lastActivity}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};