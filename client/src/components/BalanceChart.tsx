import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BalanceChartProps {
  address: string;
}

interface BalancePoint {
  date: string;
  balance: number;
  timestamp: number;
}

export const BalanceChart = ({ address }: BalanceChartProps) => {
  // Mock data — replace with API data when wired
  const balanceData: BalancePoint[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      balance: 10 + Math.random() * 5 + Math.sin(i / 5) * 2,
      timestamp: date.getTime(),
    };
  });

  const maxBalance = Math.max(...balanceData.map((d) => d.balance));
  const minBalance = Math.min(...balanceData.map((d) => d.balance));
  const currentBalance = balanceData[balanceData.length - 1].balance;

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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceData} margin={{ top: 5, right: 30, left: 12, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickMargin={8}
                  tickFormatter={(value: string | number) =>
                      new Date(String(value)).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                  }
              />
              <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickMargin={8}
                  tickFormatter={(v: number) => v.toFixed(2)}
              />

              {/* Default tooltip (no custom component) */}
              <Tooltip />

              <defs>
                <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={`hsl(var(--origin-purple))`} />
                  <stop offset="50%" stopColor={`hsl(var(--origin-cyan))`} />
                  <stop offset="100%" stopColor={`hsl(var(--origin-teal))`} />
                </linearGradient>
              </defs>
              <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="url(#balanceGradient)"
                  strokeWidth={3}
                  dot={{
                    fill: "hsl(var(--origin-purple))",
                    strokeWidth: 2,
                    r: 4,
                    filter: "drop-shadow(0 0 6px hsl(var(--origin-purple) / 0.6))",
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "hsl(var(--origin-purple))",
                    strokeWidth: 2,
                    fill: "hsl(var(--origin-cyan))",
                    filter: "drop-shadow(0 0 10px hsl(var(--origin-cyan) / 0.8))",
                  }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold text-origin-teal font-space mb-1">
              {maxBalance.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground font-space">Peak Balance</div>
          </div>

          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold text-chart-5 font-space mb-1">
              {minBalance.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground font-space">Lowest Balance</div>
          </div>

          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold ot-gradient-text font-space mb-1">
              {currentBalance.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground font-space">Current Balance</div>
          </div>
        </div>
      </div>
  );
};
