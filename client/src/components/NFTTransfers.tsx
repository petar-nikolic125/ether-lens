import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Image, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NFTTransfersProps {
  address: string;
  startBlock: string;
}

interface NFTTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  tokenID: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export const NFTTransfers = ({ address, startBlock }: NFTTransfersProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const itemsPerPage = 10;

  // Fetch NFT transfers from API
  const { data: nftData, isLoading, error } = useQuery({
    queryKey: ['nft-transfers', address, startBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${address}/nft-transfers?startBlock=${startBlock}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch NFT transfers' }));
        throw new Error(errorData.error || 'Failed to fetch NFT transfers');
      }
      return response.json();
    },
    enabled: !!address && !!startBlock,
    retry: 1,
  });

  const nftTransfers: NFTTransfer[] = nftData?.nftTransfers || [];

  // Process transactions to add type
  const processedTransfers = nftTransfers.map(transfer => ({
    ...transfer,
    type: transfer.to?.toLowerCase() === address.toLowerCase() ? "incoming" : "outgoing" as "incoming" | "outgoing",
  }));

  const filteredTransfers =
    filter === "all" ? processedTransfers : processedTransfers.filter((transfer) => transfer.type === filter);

  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransfers = filteredTransfers.slice(startIndex, startIndex + itemsPerPage);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
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
            <Image className="w-5 h-5 text-origin-cyan" />
            NFT Transfers
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
            <Image className="w-5 h-5 text-origin-cyan" />
            NFT Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
              <Image className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-destructive font-space">Failed to load NFT transfers</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {error instanceof Error ? error.message : "Unable to fetch NFT transfer data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nftTransfers.length) {
    return (
      <Card className="ot-card-glass ot-border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-space">
            <Image className="w-5 h-5 text-origin-cyan" />
            NFT Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
              <Image className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-space">No NFT transfers found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              This wallet has no NFT transfers in the specified block range
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
          <Image className="w-5 h-5 text-origin-cyan" />
          NFT Transfers (ERC-721)
          <Badge variant="secondary" className="ml-auto">
            {nftTransfers.length} transfers
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Non-fungible token transactions
        </p>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex rounded-pill p-1 ot-border-gradient bg-background">
              {[
                { key: "all", label: "All", count: processedTransfers.length },
                {
                  key: "incoming",
                  label: "In",
                  count: processedTransfers.filter((transfer) => transfer.type === "incoming").length,
                },
                {
                  key: "outgoing",
                  label: "Out",
                  count: processedTransfers.filter((transfer) => transfer.type === "outgoing").length,
                },
              ].map((option) => {
                const active = filter === (option.key as typeof filter);
                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      setFilter(option.key as typeof filter);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 text-sm font-space rounded-pill transition-all ${
                      active
                        ? "bg-gradient-primary text-primary-foreground shadow-neural"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`filter-${option.key}`}
                  >
                    {option.label} ({option.count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">NFT</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">Type</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">From</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">To</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">Token ID</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransfers.map((transfer, index) => {
                const isIncoming = transfer.type === "incoming";
                
                return (
                  <tr key={`${transfer.hash}-${transfer.tokenID}-${index}`} className="border-b border-border/20 hover:bg-secondary/5 transition-colors group">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <Image className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{transfer.tokenSymbol || "NFT"}</div>
                          <div className="text-xs text-muted-foreground">{transfer.tokenName || "Unknown Collection"}</div>
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
                        <span className="font-mono text-sm">{formatAddress(transfer.from)}</span>
                        {transfer.from.toLowerCase() === address.toLowerCase() && (
                          <Badge variant="secondary" className="text-xs bg-origin-purple/20 text-origin-purple">
                            You
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(transfer.to)}</span>
                        {transfer.to?.toLowerCase() === address.toLowerCase() && (
                          <Badge variant="secondary" className="text-xs bg-origin-purple/20 text-origin-purple">
                            You
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-mono text-sm font-bold">
                        #{transfer.tokenID}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{formatTime(transfer.timeStamp)}</span>
                        <a
                          href={`https://etherscan.io/tx/${transfer.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`link-tx-${transfer.hash}`}
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </a>
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
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransfers.length)} of {filteredTransfers.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                Previous
              </Button>
              <span className="text-sm px-3 py-1 bg-secondary rounded font-medium">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
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