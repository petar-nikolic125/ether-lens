import { Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BalanceChartProps {
  address: string;
}

interface BalancePoint {
  date: string;
  balance: string;
  balanceEth: string;
  timestamp: number;
}

interface BalanceEvolutionResponse {
  address: string;
  days: number;
  balanceData: BalancePoint[];
  stats: {
    maxBalance: string;
    minBalance: string;
    currentBalance: string;
    dataPoints: number;
  };
}

export const BalanceChart = ({ address }: BalanceChartProps) => {
  const { data, isLoading, error } = useQuery<BalanceEvolutionResponse>({
    queryKey: ['balance-evolution', address],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${address}/balance-evolution?days=30`);
      if (!response.ok) {
        throw new Error('Failed to fetch balance evolution');
      }
      return response.json();
    },
    enabled: !!address,
  });

  if (isLoading) {
    return (
      <div className="ot-card-glass rounded-2xl p-6 hover-lift ot-border-gradient transition-neural">
        <div className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ot-card-glass rounded-2xl p-6 hover-lift ot-border-gradient transition-neural">
        <div className="flex items-center justify-center h-80 text-center">
          <div className="text-muted-foreground">
            <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Failed to load balance evolution data</p>
          </div>
        </div>
      </div>
    );
  }

  const balanceData = data?.balanceData || [];
  const stats = data?.stats || { maxBalance: "0", minBalance: "0", currentBalance: "0" };

  // Format data for the chart
  const chartData = balanceData.map(point => ({
    date: point.date,
    balance: parseFloat(point.balanceEth),
    timestamp: point.timestamp
  }));

  return (
      <div
          className="ot-card-glass rounded-2xl p-6 hover-lift ot-border-gradient transition-neural"
          aria-label="ETH Balance Evolution"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold font-space mb-1">Balance Evolution</h3>
            <p className="text-muted-foreground font-inter">
              Neural analysis of ETH balance over time
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-space">Wallet</div>
            <div className="font-mono text-sm bg-secondary/20 px-3 py-1 rounded-lg border border-border/30">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          </div>
        </div>

        <div className="h-80 mb-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(4)} ETH`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number) => [`${value.toFixed(6)} ETH`, 'Balance']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-muted-foreground">
                <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No balance data available</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold text-primary font-space mb-1">
              {parseFloat(stats.maxBalance).toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground font-space">Peak Balance</div>
          </div>

          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold text-primary font-space mb-1">
              {parseFloat(stats.minBalance).toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground font-space">Lowest Balance</div>
          </div>

          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold text-primary font-space mb-1">
              {parseFloat(stats.currentBalance).toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground font-space">Current Balance</div>
          </div>
        </div>
      </div>
  );
};
