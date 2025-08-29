import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Wallet, Clock, TrendingUp, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface StatsGridProps {
  address: string;
  startBlock: string;
}

interface TransactionStats {
  totalTransactions: number;
  incomingTransactions: number;
  outgoingTransactions: number;
  totalReceived: string;
  totalSent: string;
  netBalance: string;
}

interface BalanceData {
  balance: string;
  balanceEth: string;
}

export const StatsGrid = ({ address, startBlock }: StatsGridProps) => {
  // Fetch transaction stats
  const { data: transactionData } = useQuery({
    queryKey: ['transactions', address, startBlock],
    queryFn: async (): Promise<{ stats: TransactionStats; transactions: any[] }> => {
      const response = await fetch(`/api/wallet/${address}/transactions?startBlock=${startBlock}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!address && !!startBlock,
  });

  // Fetch current balance
  const { data: balanceData } = useQuery({
    queryKey: ['balance', address],
    queryFn: async (): Promise<BalanceData> => {
      const response = await fetch(`/api/wallet/${address}/balance`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    },
    enabled: !!address,
  });

  const stats = transactionData?.stats || {
    totalTransactions: 0,
    incomingTransactions: 0,
    outgoingTransactions: 0,
    totalReceived: "0",
    totalSent: "0",
    netBalance: "0",
  };

  const currentBalance = balanceData ? parseFloat(balanceData.balanceEth) : 0;
  const totalVolume = (BigInt(stats.totalReceived) + BigInt(stats.totalSent)) / BigInt("1000000000000000000");
  
  // Calculate first and last activity from transactions
  const transactions = transactionData?.transactions || [];
  const firstActivity = transactions.length > 0 ? 
    new Date(Math.min(...transactions.map((tx: any) => new Date(tx.timestamp).getTime()))).toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0];
  const lastActivity = transactions.length > 0 ? 
    new Date(Math.max(...transactions.map((tx: any) => new Date(tx.timestamp).getTime()))).toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0];

  const usd = (n: number) =>
      new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

  const daysActive = Math.floor(
      (new Date().getTime() - new Date(firstActivity).getTime()) / (1000 * 60 * 60 * 24)
  );

  const incomingPct = (stats.incomingTransactions / stats.totalTransactions) * 100;
  const outgoingPct = (stats.outgoingTransactions / stats.totalTransactions) * 100;

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
              <div className="text-3xl font-bold mb-1 font-space">{stats.incomingTransactions.toLocaleString()}</div>
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
              <div className="text-3xl font-bold mb-1 font-space">{stats.outgoingTransactions.toLocaleString()}</div>
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
              <div className="text-3xl font-bold mb-1 font-space">{currentBalance.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground">
                ≈ {usd(currentBalance * 4352.33)}
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
                <div className="text-4xl font-bold font-space">{parseFloat(totalVolume.toString()).toFixed(4)}</div>
                <div className="text-lg text-origin-purple font-space">ETH</div>
              </div>
              <div className="text-muted-foreground">≈ {usd(parseFloat(totalVolume.toString()) * 4352.33)}</div>
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
                    <div className="text-muted-foreground font-inter">{firstActivity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold font-space">Last Activity</div>
                    <div className="text-muted-foreground font-inter">{lastActivity}</div>
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
