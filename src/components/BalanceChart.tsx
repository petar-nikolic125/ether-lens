import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BalanceChartProps {
  address: string;
}

export const BalanceChart = ({ address }: BalanceChartProps) => {
  // Mock data - in real app this would come from API
  const balanceData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      balance: 10 + Math.random() * 5 + Math.sin(i / 5) * 2,
      timestamp: date.getTime(),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-card">
          <p className="text-sm text-muted-foreground">{new Date(label).toLocaleDateString()}</p>
          <p className="text-lg font-semibold text-ethereum">
            {payload[0].value.toFixed(4)} ETH
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Balance History</h3>
          <div className="text-sm text-muted-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(2)} ETH`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(var(--ethereum))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--ethereum))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--ethereum))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-chart-3">
              {Math.max(...balanceData.map(d => d.balance)).toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">Peak Balance</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-chart-5">
              {Math.min(...balanceData.map(d => d.balance)).toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">Lowest Balance</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-ethereum">
              {balanceData[balanceData.length - 1].balance.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">Current Balance</div>
          </div>
        </div>
      </div>
    </Card>
  );
};