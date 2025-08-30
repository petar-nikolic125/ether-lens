import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Search, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const TransactionStatus = () => {
  const [txHash, setTxHash] = useState("");
  const [searchHash, setSearchHash] = useState("");

  const { data: txStatusData, isLoading, error } = useQuery({
    queryKey: ['transaction-status', searchHash],
    queryFn: async () => {
      const response = await fetch(`/api/transaction/${searchHash}/status`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch transaction status' }));
        throw new Error(errorData.error || 'Failed to fetch transaction status');
      }
      return response.json();
    },
    enabled: !!searchHash && searchHash.length === 66,
    retry: 1,
  });

  const handleSearch = () => {
    if (txHash.length === 66 && txHash.startsWith('0x')) {
      setSearchHash(txHash);
    }
  };

  const getStatusIcon = (status: any) => {
    if (!status) return <Clock className="w-5 h-5 text-muted-foreground" />;
    
    const isSuccess = status.isError === "0" || status.status === "1";
    return isSuccess ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (status: any) => {
    if (!status) return "Unknown";
    
    const isSuccess = status.isError === "0" || status.status === "1";
    return isSuccess ? "Success" : "Failed";
  };

  const getStatusColor = (status: any) => {
    if (!status) return "bg-muted/20 text-muted-foreground";
    
    const isSuccess = status.isError === "0" || status.status === "1";
    return isSuccess ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500";
  };

  return (
    <Card className="ot-card-glass ot-border-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-space">
          <Search className="w-5 h-5 text-primary" />
          Transaction Status Checker
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Check the execution status of any transaction
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Transaction Hash</label>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="font-mono"
                data-testid="input-tx-hash"
              />
              <Button 
                onClick={handleSearch} 
                disabled={!txHash || txHash.length !== 66 || !txHash.startsWith('0x') || isLoading}
                data-testid="button-check-status"
              >
                {isLoading ? "Checking..." : "Check"}
              </Button>
            </div>
            {txHash && (txHash.length !== 66 || !txHash.startsWith('0x')) && (
              <p className="text-sm text-destructive mt-1">
                Please enter a valid transaction hash (66 characters starting with 0x)
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking transaction status...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-space">Failed to check transaction status</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {error instanceof Error ? error.message : "Unable to fetch transaction status"}
            </p>
          </div>
        )}

        {/* Results */}
        {txStatusData && !isLoading && !error && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/20 border">
              {getStatusIcon(txStatusData.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Transaction Status</span>
                  <Badge className={getStatusColor(txStatusData.status)}>
                    {getStatusText(txStatusData.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {searchHash}
                </p>
              </div>
              <a
                href={`https://etherscan.io/tx/${searchHash}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-view-on-etherscan"
              >
                <ExternalLink className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>

            {/* Status Details */}
            {txStatusData.status && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm font-space">Execution Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="text-sm font-medium">{getStatusText(txStatusData.status)}</span>
                    </div>
                    {txStatusData.status.isError !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Error</span>
                        <span className="text-sm font-medium">{txStatusData.status.isError === "0" ? "No" : "Yes"}</span>
                      </div>
                    )}
                    {txStatusData.status.errDescription && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Error Description</span>
                        <span className="text-sm font-medium text-destructive">{txStatusData.status.errDescription}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Receipt Information */}
                {txStatusData.receipt && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm font-space">Receipt Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Block Number</span>
                        <span className="text-sm font-medium font-mono">
                          {parseInt(txStatusData.receipt.blockNumber, 16).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Gas Used</span>
                        <span className="text-sm font-medium font-mono">
                          {parseInt(txStatusData.receipt.gasUsed, 16).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className={txStatusData.receipt.status === "0x1" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                          {txStatusData.receipt.status === "0x1" ? "Success" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Logs Information */}
            {txStatusData.receipt?.logs && txStatusData.receipt.logs.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm font-space">Event Logs</h4>
                <div className="bg-secondary/10 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {txStatusData.receipt.logs.length} events
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Contract interactions and events emitted
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Search Yet */}
        {!searchHash && !isLoading && !error && (
          <div className="text-center py-8">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-space">Enter a transaction hash to check its status</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Get detailed execution status and receipt information
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};