import { Wallet } from "lucide-react";

interface BalanceChartProps {
  address: string;
}

interface BalancePoint {
  date: string;
  balance: number;
  timestamp: number;
}

export const BalanceChart = ({ address }: BalanceChartProps) => {
  // Show message that balance history requires API integration
  const balanceData: BalancePoint[] = [];

  const maxBalance = 0;
  const minBalance = 0;
  const currentBalance = 0;

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

        <div className="h-80 mb-6 flex items-center justify-center text-center">
          <div className="text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center opacity-50">
              <Wallet className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="font-space">Historical balance data requires API integration</p>
            <p className="text-sm mt-2">This feature will show balance evolution over time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold text-muted-foreground font-space mb-1">
              --
            </div>
            <div className="text-xs text-muted-foreground font-space">Peak Balance</div>
          </div>

          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold text-muted-foreground font-space mb-1">
              --
            </div>
            <div className="text-xs text-muted-foreground font-space">Lowest Balance</div>
          </div>

          <div className="glass rounded-xl p-4 transition-glass">
            <div className="text-2xl font-bold text-muted-foreground font-space mb-1">
              --
            </div>
            <div className="text-xs text-muted-foreground font-space">Current Balance</div>
          </div>
        </div>
      </div>
  );
};
