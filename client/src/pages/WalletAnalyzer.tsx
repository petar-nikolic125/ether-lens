import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Wallet, TrendingUp, TrendingDown, Activity, Calendar, Shuffle, Image, Hash, FileSearch } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWalletContext } from "@/contexts/WalletContext";
import { TransactionList } from "@/components/TransactionList";
import { BalanceChart } from "@/components/BalanceChart";
import { HistoricalBalance } from "@/components/HistoricalBalance";
import { InternalTransactions } from "@/components/InternalTransactions";
import { NFTTransfers } from "@/components/NFTTransfers";
import { TransactionStatus } from "@/components/TransactionStatus";
import { EventLogs } from "@/components/EventLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WalletAnalyzer = () => {
  const { account } = useWalletContext();
  const [searchAddress, setSearchAddress] = useState("");
  const [searchStartBlock, setSearchStartBlock] = useState("");
  const [activeWallet, setActiveWallet] = useState<{address: string, startBlock: string} | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (account && !searchAddress) {
      setSearchAddress(account);
    }
  }, [account, searchAddress]);

  // Fetch comprehensive wallet analysis data
  const { data: analysisData, isLoading: analysisLoading } = useQuery({
    queryKey: ['wallet-analysis', activeWallet?.address, activeWallet?.startBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${activeWallet!.address}/analyze?startBlock=${activeWallet!.startBlock}`);
      if (!response.ok) throw new Error('Failed to fetch comprehensive analysis');
      return response.json();
    },
    enabled: !!activeWallet?.address && !!activeWallet?.startBlock,
  });

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
            
            {/* Comprehensive Stats Cards */}
            {(analysisData?.stats || walletData?.stats) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="ot-card">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                        <p className="text-2xl font-bold" data-testid="stat-total-transactions">
                          {(analysisData?.stats?.totalTransactions || (walletData as any)?.stats?.totalTransactions || 0).toLocaleString()}
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
                          {(analysisData?.stats?.incomingTransactions || (walletData as any)?.stats?.incomingTransactions || 0).toLocaleString()}
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
                          {(analysisData?.stats?.outgoingTransactions || (walletData as any)?.stats?.outgoingTransactions || 0).toLocaleString()}
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
                          {(analysisData?.stats?.currentBalanceEth || (balanceData as any)?.balanceEth) ? 
                            parseFloat(analysisData?.stats?.currentBalanceEth || (balanceData as any).balanceEth).toFixed(4) : '0.0000'} ETH
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Comprehensive Analysis Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
                  <Activity className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex items-center gap-2" data-testid="tab-transactions">
                  <Wallet className="w-4 h-4" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="internal" className="flex items-center gap-2" data-testid="tab-internal">
                  <Shuffle className="w-4 h-4" />
                  Internal
                </TabsTrigger>
                <TabsTrigger value="nfts" className="flex items-center gap-2" data-testid="tab-nfts">
                  <Image className="w-4 h-4" />
                  NFTs
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2" data-testid="tab-events">
                  <Hash className="w-4 h-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-2" data-testid="tab-status">
                  <FileSearch className="w-4 h-4" />
                  Status
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <BalanceChart address={activeWallet.address} />
                  
                  {/* Comprehensive Analysis Panel */}
                  {analysisData && (
                    <Card className="ot-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-origin-purple" />
                          Wallet Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-secondary/20 rounded-lg">
                              <div className="text-2xl font-bold text-origin-teal" data-testid="analysis-total-volume">
                                {(Number(analysisData.stats.totalVolume) / 1e18).toFixed(2)} ETH
                              </div>
                              <div className="text-sm text-muted-foreground">Total Volume</div>
                            </div>
                            <div className="text-center p-4 bg-secondary/20 rounded-lg">
                              <div className="text-2xl font-bold text-origin-cyan" data-testid="analysis-token-count">
                                {analysisData.stats.tokenCount}
                              </div>
                              <div className="text-sm text-muted-foreground">Unique Tokens</div>
                            </div>
                          </div>
                          
                          {/* Activity Range */}
                          <div className="p-4 bg-gradient-primary/10 rounded-lg border border-origin-purple/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Activity Range
                            </h4>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">First Activity:</span>
                                <span className="font-mono">Block #{analysisData.stats.firstActivityBlock.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Latest Activity:</span>
                                <span className="font-mono">Block #{analysisData.stats.lastActivityBlock.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Most Used Functions */}
                          {analysisData.analysis.mostUsedFunction.length > 0 && (
                            <div className="p-4 bg-origin-cyan/10 rounded-lg border border-origin-cyan/20">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                Most Used Functions
                              </h4>
                              <div className="space-y-2">
                                {analysisData.analysis.mostUsedFunction.map((func: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <Badge variant="secondary" className="font-mono text-xs">
                                      {func.name}
                                    </Badge>
                                    <span className="text-sm font-semibold">{func.count}x</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Average Gas & Transaction Value */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-secondary/10 rounded-lg">
                              <div className="text-lg font-bold">{Math.round(analysisData.analysis.averageGasUsage).toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Avg Gas Used</div>
                            </div>
                            <div className="text-center p-3 bg-secondary/10 rounded-lg">
                              <div className="text-lg font-bold">{analysisData.analysis.averageTransactionValue.toFixed(4)} ETH</div>
                              <div className="text-xs text-muted-foreground">Avg TX Value</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Fallback to Historical Balance if analysis not available */}
                  {!analysisData && <HistoricalBalance address={activeWallet.address} />}
                </div>

                {/* Quick Transaction Overview */}
                <TransactionList address={activeWallet.address} startBlock={activeWallet.startBlock} />
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                <TransactionList address={activeWallet.address} startBlock={activeWallet.startBlock} />
              </TabsContent>

              <TabsContent value="internal" className="space-y-6">
                <InternalTransactions address={activeWallet.address} startBlock={activeWallet.startBlock} />
              </TabsContent>

              <TabsContent value="nfts" className="space-y-6">
                <NFTTransfers address={activeWallet.address} startBlock={activeWallet.startBlock} />
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <EventLogs address={activeWallet.address} startBlock={activeWallet.startBlock} />
              </TabsContent>

              <TabsContent value="status" className="space-y-6">
                <TransactionStatus />
              </TabsContent>
            </Tabs>
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