import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

interface TransactionVolumeChartProps {
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

interface TransactionResponse {
  stats: TransactionStats;
  transactions: any[];
  address: string;
}

export const TransactionVolumeChart = ({ address, startBlock }: TransactionVolumeChartProps) => {
  const { data, isLoading, error } = useQuery<TransactionResponse>({
    queryKey: ['wallet-transactions', address, startBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${address}/transactions?startBlock=${startBlock}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction data');
      }
      return response.json();
    },
    enabled: !!address && !!startBlock,
  });

  if (isLoading) {
    return (
      <div className="ot-card">
        <h3 className="text-xl font-semibold mb-4 font-space">Transaction Volume</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ot-card">
        <h3 className="text-xl font-semibold mb-4 font-space">Transaction Volume</h3>
        <div className="flex items-center justify-center h-64 text-center">
          <div className="text-muted-foreground">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Failed to load transaction volume data</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = data.stats;

  // Convert values from Wei to ETH
  const totalReceivedEth = (BigInt(stats.totalReceived) / BigInt("1000000000000000000")).toString();
  const totalSentEth = (BigInt(stats.totalSent) / BigInt("1000000000000000000")).toString();

  // Create chart data
  const chartData = [
    {
      name: 'Incoming',
      value: parseFloat(totalReceivedEth),
      count: stats.incomingTransactions,
      color: '#10b981'
    },
    {
      name: 'Outgoing', 
      value: parseFloat(totalSentEth),
      count: stats.outgoingTransactions,
      color: '#ef4444'
    }
  ];

  return (
    <div className="ot-card">
      <h3 className="text-xl font-semibold mb-4 font-space">Transaction Volume</h3>
      
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(2)} ETH`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value.toFixed(4)} ETH (${props.payload.count} txs)`,
                name
              ]}
            />
            <Bar 
              dataKey="value" 
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="glass rounded-xl p-4 transition-glass">
          <div className="text-lg font-bold text-green-500 font-space mb-1">
            {parseFloat(totalReceivedEth).toFixed(4)} ETH
          </div>
          <div className="text-xs text-muted-foreground font-space">Total Received</div>
        </div>

        <div className="glass rounded-xl p-4 transition-glass">
          <div className="text-lg font-bold text-red-500 font-space mb-1">
            {parseFloat(totalSentEth).toFixed(4)} ETH
          </div>
          <div className="text-xs text-muted-foreground font-space">Total Sent</div>
        </div>

        <div className="glass rounded-xl p-4 transition-glass">
          <div className="text-lg font-bold text-primary font-space mb-1">
            {stats.totalTransactions}
          </div>
          <div className="text-xs text-muted-foreground font-space">Total Transactions</div>
        </div>
      </div>
    </div>
  );
};