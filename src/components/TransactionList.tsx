import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock, Hash, Filter } from "lucide-react";

interface TransactionListProps {
  address: string;
  startBlock: string;
}

interface Transaction {
  hash: string;
  block: number;
  timestamp: string;
  from: string;
  to: string;
  value: number;
  type: "incoming" | "outgoing";
  gasUsed: number;
  gasPrice: number;
}

export const TransactionList = ({ address, startBlock }: TransactionListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const itemsPerPage = 10;

  // Mock data - in real app this would come from API
  const allTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    block: Number(startBlock) + i * 100,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    from: i % 2 === 0 ? address : `0x${Math.random().toString(16).substr(2, 40)}`,
    to: i % 2 === 0 ? `0x${Math.random().toString(16).substr(2, 40)}` : address,
    value: Math.random() * 10,
    type: i % 2 === 0 ? "outgoing" : "incoming",
    gasUsed: 21000 + Math.floor(Math.random() * 50000),
    gasPrice: 20 + Math.random() * 80,
  }));

  const filteredTransactions = filter === "all" 
    ? allTransactions 
    : allTransactions.filter(tx => tx.type === filter);

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatValue = (value: number) => value.toFixed(4);
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold font-space mb-2">Neural Transaction History</h2>
          <p className="text-muted-foreground font-inter">Comprehensive blockchain activity analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex bg-secondary/20 rounded-xl p-1">
              {[
                { key: "all", label: "All", count: allTransactions.length },
                { key: "incoming", label: "In", count: allTransactions.filter(tx => tx.type === "incoming").length },
                { key: "outgoing", label: "Out", count: allTransactions.filter(tx => tx.type === "outgoing").length },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    setFilter(option.key as any);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-space rounded-lg transition-all ${
                    filter === option.key
                      ? "bg-gradient-primary text-primary-foreground shadow-neural"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>
          <Badge variant="secondary" className="font-space">
            {filteredTransactions.length} transactions
          </Badge>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
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
                <tr 
                  key={tx.hash} 
                  className="border-b border-border/20 hover:bg-secondary/5 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        tx.type === "incoming" ? "bg-origin-teal animate-pulse-slow" : "bg-chart-5 animate-pulse-slow"
                      }`} style={{ animationDelay: `${index * 0.1}s` }} />
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-space">{formatAddress(tx.hash)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-origin-purple/20"
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
                    <div className={`font-semibold font-space ${
                      tx.type === "incoming" ? "text-origin-teal" : "text-chart-5"
                    }`}>
                      {tx.type === "incoming" ? "+" : "-"}{formatValue(tx.value)}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm text-muted-foreground font-inter">
                      {tx.gasUsed.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground/70 font-space">
                      {tx.gasPrice.toFixed(1)} Gwei
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex items-center justify-between p-6 border-t border-border/30 bg-secondary/5">
          <div className="text-sm text-muted-foreground font-inter">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="font-space bg-secondary/20 hover:bg-origin-purple/20 hover:border-origin-purple/50"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
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
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="font-space bg-secondary/20 hover:bg-origin-cyan/20 hover:border-origin-cyan/50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};