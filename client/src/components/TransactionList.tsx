import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TransactionListProps {
  address: string;
  startBlock: string;
}

interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  fromAddress: string;
  toAddress: string | null;
  value: string;
  gasUsed: number;
  gasPrice: number;
  isError: boolean;
}

export const TransactionList = ({ address, startBlock }: TransactionListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const itemsPerPage = 10;

  // Fetch transactions from API
  const { data: transactionData, isLoading } = useQuery({
    queryKey: ['transactions', address, startBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${address}/transactions?startBlock=${startBlock}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!address && !!startBlock,
  });

  const allTransactions: Transaction[] = transactionData?.transactions || [];

  // Process transactions to add type
  const processedTransactions = allTransactions.map(tx => ({
    ...tx,
    type: tx.toAddress?.toLowerCase() === address.toLowerCase() ? "incoming" : "outgoing" as "incoming" | "outgoing",
    block: tx.blockNumber,
    from: tx.fromAddress,
    to: tx.toAddress || "",
    value: parseFloat(tx.value) / 1e18, // Convert from Wei to ETH
  }));

  const filteredTransactions =
      filter === "all" ? processedTransactions : processedTransactions.filter((tx) => tx.type === filter);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatValue = (value: number) => value.toFixed(4);
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

  // Page window like 1…5 / centered when possible
  const pageWindowStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + 4);
  const pages = Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, i) => pageWindowStart + i);

  return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-space mb-2">
              <span className="ot-gradient-text">Neural Transaction History</span>
            </h2>
            <p className="text-muted-foreground font-inter">Comprehensive blockchain activity analysis</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
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
                          aria-pressed={active}
                      >
                        {option.label} ({option.count})
                      </button>
                  );
                })}
              </div>
            </div>
            <Badge variant="secondary" className="font-space">
              {filteredTransactions.length} transactions
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden ot-border-gradient">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b border-border/30 bg-secondary/10">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground font-space">Transaction</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground font-space">Block</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground font-space">Age</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground font-space">From</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground font-space">To</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground font-space">Value (ETH)</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground font-space">Gas</th>
              </tr>
              </thead>
              <tbody>
              {paginatedTransactions.map((tx, index) => (
                  <tr key={tx.hash} className="border-b border-border/20 hover:bg-secondary/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                tx.type === "incoming" ? "bg-origin-teal" : "bg-chart-5"
                            } animate-pulse-slow`}
                            style={{ animationDelay: `${index * 0.08}s` }}
                            aria-hidden
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-space">{formatAddress(tx.hash)}</span>
                          <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-origin-purple/20"
                              aria-label="Open on explorer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge variant="outline" className="font-mono text-xs bg-secondary/20">
                        {tx.block.toLocaleString()}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
                        <Clock className="w-3 h-3" />
                        {formatTime(tx.timestamp)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-inter">{formatAddress(tx.from)}</span>
                        {tx.from.toLowerCase() === address.toLowerCase() && (
                            <Badge variant="secondary" className="text-xs bg-origin-purple/20 text-origin-purple">
                              You
                            </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.type === "incoming" ? (
                            <ArrowDownLeft className="w-4 h-4 text-origin-teal" />
                        ) : (
                            <ArrowUpRight className="w-4 h-4 text-chart-5" />
                        )}
                        <span className="font-mono text-sm font-inter">{formatAddress(tx.to)}</span>
                        {tx.to.toLowerCase() === address.toLowerCase() && (
                            <Badge variant="secondary" className="text-xs bg-origin-cyan/20 text-origin-cyan">
                              You
                            </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div
                          className={`font-semibold font-space ${
                              tx.type === "incoming" ? "text-origin-teal" : "text-chart-5"
                          }`}
                      >
                        {tx.type === "incoming" ? "+" : "-"}
                        {formatValue(tx.value)}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="text-sm text-muted-foreground font-inter">{tx.gasUsed.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground/70 font-space">{tx.gasPrice.toFixed(1)} Gwei</div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-6 border-t border-border/30 bg-secondary/5">
            <div className="text-sm text-muted-foreground font-inter">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} transactions
            </div>

            <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="font-space bg-secondary/20 hover:bg-origin-purple/20 hover:border-origin-purple/50"
                  aria-label="Previous page"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {pageWindowStart > 1 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10 p-0 font-space hover:bg-secondary/30"
                        onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                )}
                {pageWindowStart > 2 && <span className="px-1 text-muted-foreground">…</span>}
                {pages.map((page) => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        className={`w-10 h-10 p-0 font-space ${
                            currentPage === page
                                ? "bg-gradient-primary text-primary-foreground shadow-neural"
                                : "hover:bg-secondary/30"
                        }`}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </Button>
                ))}
                {pageWindowEnd < totalPages - 1 && <span className="px-1 text-muted-foreground">…</span>}
                {pageWindowEnd < totalPages && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10 p-0 font-space hover:bg-secondary/30"
                        onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                )}
              </div>

              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="font-space bg-secondary/20 hover:bg-origin-cyan/20 hover:border-origin-cyan/50"
                  aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
};
