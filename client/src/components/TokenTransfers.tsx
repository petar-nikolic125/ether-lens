import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TokenTransfersProps {
  address: string;
  startBlock: string;
}

interface TokenTransfer {
  transactionHash: string;
  blockNumber: number;
  fromAddress: string;
  toAddress: string;
  contractAddress: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  timestamp: string;
}

export const TokenTransfers = ({ address, startBlock }: TokenTransfersProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch token transfers from API
  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['tokens', address, startBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${address}/tokens?startBlock=${startBlock}`);
      if (!response.ok) {
        // Handle API errors gracefully
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch token transfers' }));
        throw new Error(errorData.error || 'Failed to fetch token transfers');
      }
      return response.json();
    },
    enabled: !!address && !!startBlock,
    retry: 1, // Only retry once for token transfers
  });

  const tokenTransfers: TokenTransfer[] = tokenData?.tokenTransfers || [];

  const totalPages = Math.ceil(tokenTransfers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransfers = tokenTransfers.slice(startIndex, startIndex + itemsPerPage);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatValue = (value: string, decimals: number) => {
    const amount = parseFloat(value) / Math.pow(10, decimals);
    return amount.toFixed(4);
  };
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  if (isLoading) {
    return (
      <Card className="ot-card-glass ot-border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-space">
            <Coins className="w-5 h-5 text-origin-cyan" />
            Token Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="ot-card-glass ot-border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-space">
            <Coins className="w-5 h-5 text-origin-cyan" />
            Token Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-destructive font-space">Failed to load token transfers</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {error instanceof Error ? error.message : "Unable to fetch token transfer data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tokenTransfers.length) {
    return (
      <Card className="ot-card-glass ot-border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-space">
            <Coins className="w-5 h-5 text-origin-cyan" />
            Token Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-space">No token transfers found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {tokenData?.message || `This address may not have any ERC-20 token activity since block ${startBlock}`}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="ot-card-glass ot-border-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-space">
          <Coins className="w-5 h-5 text-origin-cyan" />
          Token Transfers
          <Badge variant="secondary" className="ml-auto">
            {tokenTransfers.length} transfers
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          ERC-20 token transactions for this wallet
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">Token</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">Type</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">From</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">To</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground font-space">Amount</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransfers.map((transfer, index) => {
                const isIncoming = transfer.toAddress.toLowerCase() === address.toLowerCase();
                
                return (
                  <tr key={`${transfer.transactionHash}-${transfer.contractAddress}`} className="border-b border-border/20 hover:bg-secondary/5 transition-colors group">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-foreground">
                            {transfer.tokenSymbol?.slice(0, 2) || "??"}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{transfer.tokenSymbol}</div>
                          <div className="text-xs text-muted-foreground">{transfer.tokenName}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isIncoming ? (
                          <ArrowDownLeft className="w-4 h-4 text-origin-teal" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-chart-5" />
                        )}
                        <span className={`text-sm font-medium ${isIncoming ? 'text-origin-teal' : 'text-chart-5'}`}>
                          {isIncoming ? 'In' : 'Out'}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(transfer.fromAddress)}</span>
                        {transfer.fromAddress.toLowerCase() === address.toLowerCase() && (
                          <Badge variant="secondary" className="text-xs bg-origin-purple/20 text-origin-purple">
                            You
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(transfer.toAddress)}</span>
                        {transfer.toAddress.toLowerCase() === address.toLowerCase() && (
                          <Badge variant="secondary" className="text-xs bg-origin-cyan/20 text-origin-cyan">
                            You
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      <div className={`font-semibold ${isIncoming ? 'text-origin-teal' : 'text-chart-5'}`}>
                        {isIncoming ? '+' : '-'}{formatValue(transfer.value, transfer.tokenDecimals)}
                      </div>
                      <div className="text-xs text-muted-foreground">{transfer.tokenSymbol}</div>
                    </td>

                    <td className="p-3">
                      <div className="text-sm text-muted-foreground">
                        {formatTime(transfer.timestamp)}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-5 h-5 p-0 hover:bg-origin-purple/20"
                          aria-label="View transaction"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, tokenTransfers.length)} of{" "}
              {tokenTransfers.length} transfers
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="font-space"
              >
                Previous
              </Button>
              
              <span className="text-sm px-3 py-1 bg-secondary/20 rounded">
                {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="font-space"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};