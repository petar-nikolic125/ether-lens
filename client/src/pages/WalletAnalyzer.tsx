import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Wallet, TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TransactionList } from "@/components/TransactionList";
import { BalanceChart } from "@/components/BalanceChart";
import { HistoricalBalance } from "@/components/HistoricalBalance";

const WalletAnalyzer = () => {
  const [searchAddress, setSearchAddress] = useState("");
  const [searchStartBlock, setSearchStartBlock] = useState("");
  const [activeWallet, setActiveWallet] = useState<{address: string, startBlock: string} | null>(null);

  const { data: walletData, isLoading, error } = useQuery({
    queryKey: ['wallet-transactions', activeWallet?.address, activeWallet?.startBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${activeWallet!.address}/transactions?startBlock=${activeWallet!.startBlock}`);
      if (!response.ok) throw new Error('Failed to fetch wallet data');
      return response.json();
    },
    enabled: !!activeWallet?.address && !!activeWallet?.startBlock,
  });

  const { data: balanceData } = useQuery({
    queryKey: ['wallet-current-balance', activeWallet?.address],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${activeWallet!.address}/balance`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    },
    enabled: !!activeWallet?.address,
  });

  const handleAnalyze = () => {
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

    setActiveWallet({ address: searchAddress, startBlock: searchStartBlock });
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-space text-foreground mb-2">Wallet Analyzer</h1>
          <p className="text-muted-foreground">Comprehensive Ethereum wallet analysis and transaction tracking</p>
        </div>

        {/* Search Form */}
        <Card className="ot-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Analyze Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">Ethereum Address</label>
                <Input
                  placeholder="0x..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  data-testid="input-wallet-address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Starting Block</label>
                <Input
                  placeholder="19000000"
                  value={searchStartBlock}
                  onChange={(e) => setSearchStartBlock(e.target.value)}
                  data-testid="input-start-block"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleAnalyze} disabled={isLoading} data-testid="button-analyze-wallet">
                {isLoading ? "Analyzing..." : "Analyze Wallet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Overview */}
        {activeWallet && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Analysis for {activeWallet.address.slice(0, 8)}...{activeWallet.address.slice(-6)}
            </h2>
            
            {/* Stats Cards */}
            {(walletData as any)?.stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="ot-card">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                        <p className="text-2xl font-bold" data-testid="stat-total-transactions">
                          {(walletData as any)?.stats?.totalTransactions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="ot-card">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Incoming</p>
                        <p className="text-2xl font-bold text-success" data-testid="stat-incoming-transactions">
                          {(walletData as any)?.stats?.incomingTransactions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="ot-card">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="text-sm text-muted-foreground">Outgoing</p>
                        <p className="text-2xl font-bold text-destructive" data-testid="stat-outgoing-transactions">
                          {(walletData as any)?.stats?.outgoingTransactions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="ot-card">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-2xl font-bold" data-testid="stat-current-balance">
                          {(balanceData as any)?.balanceEth ? parseFloat((balanceData as any).balanceEth).toFixed(4) : '0.0000'} ETH
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <BalanceChart address={activeWallet.address} />
              <HistoricalBalance address={activeWallet.address} />
            </div>

            {/* Transaction List */}
            <TransactionList address={activeWallet.address} startBlock={activeWallet.startBlock} />
          </div>
        )}

        {error && (
          <Card className="ot-card text-center py-8">
            <CardContent>
              <p className="text-destructive">Failed to load wallet data. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {!activeWallet && (
          <Card className="ot-card text-center py-8">
            <CardContent>
              <div className="max-w-md mx-auto">
                <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Wallet Analysis</h3>
                <p className="text-muted-foreground">
                  Enter an Ethereum wallet address and starting block to analyze transaction history, 
                  balance changes, and get comprehensive insights.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default WalletAnalyzer;