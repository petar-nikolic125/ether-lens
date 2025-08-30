import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Hash, User, Gauge } from "lucide-react";

const LatestBlocks = () => {
  const { data: blocksData, isLoading } = useQuery({
    queryKey: ["/api/latest-blocks"],
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-space text-foreground mb-2">Latest Blocks</h1>
          <p className="text-muted-foreground">Real-time Ethereum blockchain blocks</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(blocksData as any)?.blocks?.map((block: any) => (
              <Card key={block.number} className="ot-card hover-lift" data-testid={`block-card-${block.number}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hash className="w-5 h-5 text-primary" />
                    Block #{block.number}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Miner:</span>
                    <span className="text-sm font-mono text-foreground truncate">
                      {block.miner?.slice(0, 10)}...{block.miner?.slice(-6)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Transactions:</span>
                    <Badge variant="secondary" data-testid={`block-tx-count-${block.number}`}>
                      {block.txCount || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Gas Used:</span>
                    <Badge variant="outline">
                      {block.gasUsed}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-success" data-testid={`block-time-${block.number}`}>
                      {block.timeAgo}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!(blocksData as any)?.blocks || (blocksData as any)?.blocks?.length === 0) && (
          <Card className="ot-card text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">No blocks available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LatestBlocks;