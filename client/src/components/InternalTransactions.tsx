import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Shuffle, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface InternalTransactionsProps {
  address: string;
  startBlock: string;
}

interface InternalTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  input: string;
  type: string;
  gas: string;
  gasUsed: string;
  traceId: string;
  isError: string;
  errCode: string;
}

export const InternalTransactions = ({ address, startBlock }: InternalTransactionsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const itemsPerPage = 10;

  // Fetch internal transactions from API
  const { data: internalData, isLoading, error } = useQuery({
    queryKey: ['internal-transactions', address, startBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${address}/internal-transactions?startBlock=${startBlock}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch internal transactions' }));
        throw new Error(errorData.error || 'Failed to fetch internal transactions');
      }
      return response.json();
    },
    enabled: !!address && !!startBlock,
    retry: 1,
  });

  const internalTransactions: InternalTransaction[] = internalData?.internalTransactions || [];

  // Process transactions to add type
  const processedTransactions = internalTransactions.map(tx => ({
    ...tx,
    type: tx.to?.toLowerCase() === address.toLowerCase() ? "incoming" : "outgoing" as "incoming" | "outgoing",
    valueEth: parseFloat(tx.value) / 1e18,
  }));

  const filteredTransactions =
    filter === "all" ? processedTransactions : processedTransactions.filter((tx) => tx.type === filter);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatValue = (value: number) => value.toFixed(6);
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
            <Shuffle className="w-5 h-5 text-origin-purple" />
            Internal Transactions
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
            <Shuffle className="w-5 h-5 text-origin-purple" />
            Internal Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
              <Shuffle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-destructive font-space">Failed to load internal transactions</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {error instanceof Error ? error.message : "Unable to fetch internal transaction data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!internalTransactions.length) {
    return (
      <Card className="ot-card-glass ot-border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-space">
            <Shuffle className="w-5 h-5 text-origin-purple" />
            Internal Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
              <Shuffle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-space">No internal transactions found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              This wallet has no internal transactions in the specified block range
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
          <Shuffle className="w-5 h-5 text-origin-purple" />
          Internal Transactions
          <Badge variant="secondary" className="ml-auto">
            {internalTransactions.length} transactions
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Contract execution and internal calls
        </p>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex rounded-pill p-1 ot-border-gradient bg-background">
              {[
                { key: "all", label: "All", count: processedTransactions.length },
                {
                  key: "incoming",
                  label: "In",
                  count: processedTransactions.filter((tx) => tx.type === "incoming").length,
                },
                {
                  key: "outgoing",
                  label: "Out",
                  count: processedTransactions.filter((tx) => tx.type === "outgoing").length,
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
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">Type</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">From</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">To</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground font-space">Value (ETH)</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground font-space">Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx, index) => {
                const isIncoming = tx.type === "incoming";
                
                return (
                  <tr key={`${tx.hash}-${index}`} className="border-b border-border/20 hover:bg-secondary/5 transition-colors group">
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
                        <span className="font-mono text-sm">{formatAddress(tx.from)}</span>
                        {tx.from.toLowerCase() === address.toLowerCase() && (
                          <Badge variant="secondary" className="text-xs bg-origin-purple/20 text-origin-purple">
                            You
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(tx.to)}</span>
                        {tx.to?.toLowerCase() === address.toLowerCase() && (
                          <Badge variant="secondary" className="text-xs bg-origin-purple/20 text-origin-purple">
                            You
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      <span className="font-mono text-sm font-bold">
                        {formatValue(tx.valueEth)}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{formatTime(tx.timeStamp)}</span>
                        <a
                          href={`https://etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`link-tx-${tx.hash}`}
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
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
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