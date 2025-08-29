import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock, Hash } from "lucide-react";

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
  const itemsPerPage = 10;

  // Mock data - in real app this would come from API
  const transactions: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
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

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatValue = (value: number) => value.toFixed(4);
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <Badge variant="secondary">
          {transactions.length} transactions found
        </Badge>
      </div>

      <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Block</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Age</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">From</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">To</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Value (ETH)</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Gas</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx, index) => (
                <tr 
                  key={tx.hash} 
                  className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        tx.type === "incoming" ? "bg-chart-3" : "bg-chart-5"
                      }`} />
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(tx.hash)}</span>
                        <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="font-mono text-xs">
                      {tx.block.toLocaleString()}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{formatAddress(tx.from)}</span>
                      {tx.from.toLowerCase() === address.toLowerCase() && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {tx.type === "incoming" ? (
                        <ArrowDownLeft className="w-4 h-4 text-chart-3" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-chart-5" />
                      )}
                      <span className="font-mono text-sm">{formatAddress(tx.to)}</span>
                      {tx.to.toLowerCase() === address.toLowerCase() && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-semibold ${
                      tx.type === "incoming" ? "text-chart-3" : "text-chart-5"
                    }`}>
                      {tx.type === "incoming" ? "+" : "-"}{formatValue(tx.value)}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm text-muted-foreground">
                      {tx.gasUsed.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tx.gasPrice.toFixed(1)} Gwei
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
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
                    className="w-8 h-8 p-0"
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
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};