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
        <div className="glass rounded-xl p-4 shadow-neural border border-border/30">
          <p className="text-sm text-muted-foreground font-space mb-1">
            {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-xl font-bold font-space bg-gradient-primary bg-clip-text text-transparent">
            {payload[0].value.toFixed(4)} ETH
          </p>
          <p className="text-xs text-muted-foreground">
            ≈ ${(payload[0].value * 4352.33).toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 group hover:shadow-neural transition-neural">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold font-space mb-2">Balance Evolution</h3>
          <p className="text-muted-foreground font-inter">Neural analysis of ETH balance over time</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground font-space">Wallet</div>
          <div className="font-mono text-sm bg-secondary/20 px-3 py-1 rounded-lg border border-border/30">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
      </div>
      
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={balanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric' 
              })}
              className="font-inter"
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(2)}`}
              className="font-inter"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="url(#balanceGradient)"
              strokeWidth={3}
              dot={{ 
                fill: "hsl(var(--origin-purple))", 
                strokeWidth: 2, 
                r: 4,
                filter: "drop-shadow(0 0 6px hsl(var(--origin-purple) / 0.6))"
              }}
              activeDot={{ 
                r: 6, 
                stroke: "hsl(var(--origin-purple))", 
                strokeWidth: 2,
                fill: "hsl(var(--origin-cyan))",
                filter: "drop-shadow(0 0 10px hsl(var(--origin-cyan) / 0.8))"
              }}
            />
            <defs>
              <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--origin-purple))" />
                <stop offset="50%" stopColor="hsl(var(--origin-cyan))" />
                <stop offset="100%" stopColor="hsl(var(--origin-teal))" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="glass rounded-xl p-4 transition-glass">
          <div className="text-2xl font-bold text-origin-teal font-space mb-1">
            {Math.max(...balanceData.map(d => d.balance)).toFixed(4)}
          </div>
          <div className="text-xs text-muted-foreground font-space">Peak Balance</div>
        </div>
        
        <div className="glass rounded-xl p-4 transition-glass">
          <div className="text-2xl font-bold text-chart-5 font-space mb-1">
            {Math.min(...balanceData.map(d => d.balance)).toFixed(4)}
          </div>
          <div className="text-xs text-muted-foreground font-space">Lowest Balance</div>
        </div>
        
        <div className="glass rounded-xl p-4 transition-glass">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-space mb-1">
            {balanceData[balanceData.length - 1].balance.toFixed(4)}
          </div>
          <div className="text-xs text-muted-foreground font-space">Current Balance</div>
        </div>
      </div>
    </div>
  );
};