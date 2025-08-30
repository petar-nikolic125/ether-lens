import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Coins, ArrowRightLeft, Clock, Hash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TokenTracker = () => {
  const [searchAddress, setSearchAddress] = useState("");
  const [searchStartBlock, setSearchStartBlock] = useState("");
  const [activeSearch, setActiveSearch] = useState<{address: string, startBlock: string} | null>(null);

  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['tokens', activeSearch?.address, activeSearch?.startBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${activeSearch?.address}/tokens?startBlock=${activeSearch?.startBlock}`);
      if (!response.ok) throw new Error('Failed to fetch token transfers');
      return response.json();
    },
    enabled: !!activeSearch?.address,
  });

  const handleSearch = () => {
    if (!searchAddress || !searchStartBlock) {
      toast({
        title: "Missing Information",
        description: "Please enter both wallet address and starting block number.",
        variant: "destructive",
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(searchAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum wallet address.",
        variant: "destructive",
      });
      return;
    }

    setActiveSearch({ address: searchAddress, startBlock: searchStartBlock });
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-space text-foreground mb-2">Token Tracker</h1>
          <p className="text-muted-foreground">Track ERC-20 token transfers for any Ethereum address</p>
        </div>

        {/* Search Form */}
        <Card className="ot-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Token Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">Ethereum Address</label>
                <Input
                  placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  data-testid="input-token-address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Starting Block</label>
                <Input
                  placeholder="18000000"
                  value={searchStartBlock}
                  onChange={(e) => setSearchStartBlock(e.target.value)}
                  data-testid="input-start-block"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch} disabled={isLoading} data-testid="button-search-tokens">
                {isLoading ? "Searching..." : "Track Tokens"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(tokenData as any)?.tokenTransfers && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Token Transfers for {activeSearch?.address?.slice(0, 8)}...{activeSearch?.address?.slice(-6)}
            </h2>
            
            {(tokenData as any)?.tokenTransfers?.map((transfer: any, index: number) => (
              <Card key={transfer.transactionHash || index} className="ot-card hover-lift" data-testid={`token-transfer-${index}`}>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{transfer.tokenSymbol || 'Unknown'}</span>
                        <Badge variant="outline">{transfer.tokenName || 'Unknown Token'}</Badge>
                      </div>
                      <Badge variant="secondary" data-testid={`token-amount-${index}`}>
                        {(parseFloat(transfer.value) / Math.pow(10, transfer.tokenDecimals || 18)).toFixed(6)} {transfer.tokenSymbol}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">From:</span>
                        <span className="text-sm font-mono">
                          {transfer.fromAddress?.slice(0, 8)}...{transfer.fromAddress?.slice(-6)}
                        </span>
                      </div>
                      
                      <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">To:</span>
                        <span className="text-sm font-mono">
                          {transfer.toAddress?.slice(0, 8)}...{transfer.toAddress?.slice(-6)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono text-muted-foreground">
                          {transfer.transactionHash?.slice(0, 16)}...{transfer.transactionHash?.slice(-8)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-success">
                          {new Date(transfer.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="ot-card text-center py-8">
            <CardContent>
              <p className="text-destructive">Failed to load token transfers. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !tokenData && (
          <Card className="ot-card text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">Enter a wallet address to track token transfers.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TokenTracker;