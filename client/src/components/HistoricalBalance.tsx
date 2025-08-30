import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Coins, Loader2 } from "lucide-react";
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
  balanceEth?: string;
  balanceFormatted?: string;
  contractAddress?: string;
  tokenInfo?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  transferCount?: number;
}

interface Token {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
}

export const HistoricalBalance = ({ address }: HistoricalBalanceProps) => {
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balanceData, setBalanceData] = useState<HistoricalBalanceData | null>(null);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("ETH");
  const [tokensLoading, setTokensLoading] = useState(false);

  // Load available tokens on component mount
  useEffect(() => {
    const loadTokens = async () => {
      setTokensLoading(true);
      try {
        const response = await fetch(`/api/wallet/${address}/tokens`);
        if (response.ok) {
          const data = await response.json();
          if (data.tokenTransfers && data.tokenTransfers.length > 0) {
            // Extract unique tokens from transfers
            const uniqueTokens: Token[] = [];
            const seen = new Set<string>();
            
            for (const transfer of data.tokenTransfers) {
              const addr = transfer.contractAddress?.toLowerCase();
              if (addr && !seen.has(addr) && transfer.tokenName) {
                seen.add(addr);
                uniqueTokens.push({
                  contractAddress: transfer.contractAddress,
                  tokenName: transfer.tokenName,
                  tokenSymbol: transfer.tokenSymbol || 'UNKNOWN',
                  tokenDecimals: transfer.tokenDecimals || 18
                });
              }
            }
            setAvailableTokens(uniqueTokens);
          }
        }
      } catch (error) {
        console.warn('Could not load tokens:', error);
      } finally {
        setTokensLoading(false);
      }
    };
    
    if (address) {
      loadTokens();
    }
  }, [address]);

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
      let response;
      
      if (selectedAsset === "ETH") {
        response = await fetch(`/api/wallet/${address}/balance-at-date?date=${date}`);
      } else {
        response = await fetch(`/api/wallet/${address}/token-balance-at-date?date=${date}&contractAddress=${selectedAsset}`);
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch historical balance');
      }

      const data = await response.json();
      setBalanceData(data);
      
      const balanceAmount = selectedAsset === "ETH" 
        ? `${parseFloat(data.balanceEth).toFixed(4)} ETH`
        : `${parseFloat(data.balanceFormatted).toFixed(4)} ${data.tokenInfo?.symbol || 'tokens'}`;
      
      toast({
        title: "Historical Balance Retrieved",
        description: `Balance found for ${date}: ${balanceAmount}`,
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
          Find the exact ETH or token balance at any past date (00:00 UTC)
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="asset" className="block text-sm font-medium mb-2 font-space">
                Asset
              </label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="ot-input">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                  {tokensLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading tokens...
                    </SelectItem>
                  ) : (
                    availableTokens.map((token) => (
                      <SelectItem key={token.contractAddress} value={token.contractAddress}>
                        {token.tokenSymbol} ({token.tokenName})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
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
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !date || !selectedAsset}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
        </form>

        {balanceData && (
          <div className="mt-6 p-4 rounded-lg bg-secondary/10 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-5 h-5 text-origin-teal" />
              <h3 className="font-semibold font-space">
                {selectedAsset === "ETH" ? "ETH" : balanceData.tokenInfo?.symbol || "Token"} Balance on {balanceData.date}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {selectedAsset === "ETH" ? "ETH Balance" : `${balanceData.tokenInfo?.symbol || "Token"} Balance`}
                </div>
                <div className="text-2xl font-bold font-space text-origin-teal">
                  {selectedAsset === "ETH" 
                    ? `${parseFloat(balanceData.balanceEth || '0').toFixed(6)} ETH`
                    : `${parseFloat(balanceData.balanceFormatted || '0').toFixed(6)} ${balanceData.tokenInfo?.symbol || 'tokens'}`
                  }
                </div>
                {selectedAsset === "ETH" ? (
                  <div className="text-sm text-muted-foreground">
                    ≈ {usd(parseFloat(balanceData.balanceEth || '0') * 4352.33)}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {balanceData.tokenInfo?.name || "Unknown Token"}
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Block Details</div>
                <div className="text-lg font-semibold font-space">
                  Block #{balanceData.blockNumber.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(balanceData.timestamp)}
                </div>
                {balanceData.transferCount !== undefined && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on {balanceData.transferCount} transfers
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};