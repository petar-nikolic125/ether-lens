import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRightLeft, Hash, Coins } from "lucide-react";

const LatestTransactions = () => {
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["/api/latest-transactions"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-space text-foreground mb-2">Latest Transactions</h1>
          <p className="text-muted-foreground">Real-time Ethereum network transactions</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(transactionsData as any)?.transactions?.map((tx: any, index: number) => (
              <Card key={tx.hash || index} className="ot-card hover-lift" data-testid={`transaction-card-${index}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-primary" />
                        <span className="text-sm font-mono text-foreground">
                          {tx.hash?.slice(0, 16)}...{tx.hash?.slice(-8)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">From:</span>
                          <span className="text-xs font-mono text-foreground">
                            {tx.from?.slice(0, 8)}...{tx.from?.slice(-6)}
                          </span>
                        </div>
                        
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">To:</span>
                          <span className="text-xs font-mono text-foreground">
                            {tx.to?.slice(0, 8)}...{tx.to?.slice(-6)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-success" data-testid={`transaction-time-${index}`}>
                          {tx.timeAgo}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline" className="font-mono" data-testid={`transaction-value-${index}`}>
                        {parseFloat(tx.value).toFixed(4)} ETH
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!(transactionsData as any)?.transactions || (transactionsData as any)?.transactions?.length === 0) && (
          <Card className="ot-card text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">No transactions available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LatestTransactions;