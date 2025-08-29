import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Coins } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HistoricalBalanceProps {
  address: string;
}

interface HistoricalBalanceData {
  address: string;
  date: string;
  blockNumber: number;
  timestamp: number;
  balance: string;
  balanceEth: string;
}

export const HistoricalBalance = ({ address }: HistoricalBalanceProps) => {
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balanceData, setBalanceData] = useState<HistoricalBalanceData | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        title: "Missing Date",
        description: "Please enter a date in YYYY-MM-DD format.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      toast({
        title: "Invalid Date Format",
        description: "Please enter date in YYYY-MM-DD format.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/wallet/${address}/balance-at-date?date=${date}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch historical balance');
      }

      const data = await response.json();
      setBalanceData(data);
      
      toast({
        title: "Historical Balance Retrieved",
        description: `Balance found for ${date}: ${parseFloat(data.balanceEth).toFixed(4)} ETH`,
      });
    } catch (error) {
      toast({
        title: "Lookup Failed",
        description: error instanceof Error ? error.message : "Failed to fetch historical balance",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const usd = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

  return (
    <Card className="ot-card-glass ot-border-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-space">
          <Calendar className="w-5 h-5 text-origin-purple" />
          Historical Balance Lookup
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find the exact ETH balance at any past date (00:00 UTC)
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-medium mb-2 font-space">
                Date (YYYY-MM-DD)
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ot-input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Lookup Balance
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {balanceData && (
          <div className="mt-6 p-4 rounded-lg bg-secondary/10 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-5 h-5 text-origin-teal" />
              <h3 className="font-semibold font-space">Balance on {balanceData.date}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">ETH Balance</div>
                <div className="text-2xl font-bold font-space text-origin-teal">
                  {parseFloat(balanceData.balanceEth).toFixed(6)} ETH
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ {usd(parseFloat(balanceData.balanceEth) * 4352.33)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Block Details</div>
                <div className="text-lg font-semibold font-space">
                  Block #{balanceData.blockNumber.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(balanceData.timestamp)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};