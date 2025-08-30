import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Activity, Hash, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface EventLogsProps {
  address: string;
  startBlock: string;
}

interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  timeStamp?: string;
  gasPrice?: string;
  gasUsed?: string;
  logIndex: string;
  transactionHash: string;
  transactionIndex: string;
}

export const EventLogs = ({ address, startBlock }: EventLogsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate end block (last 10000 blocks from start)
  const endBlock = Math.max(parseInt(startBlock), parseInt(startBlock) + 10000).toString();

  // Fetch event logs from API
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['event-logs', address, startBlock, endBlock],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${address}/events?fromBlock=${startBlock}&toBlock=${endBlock}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch event logs' }));
        throw new Error(errorData.error || 'Failed to fetch event logs');
      }
      return response.json();
    },
    enabled: !!address && !!startBlock,
    retry: 1,
  });

  const events: EventLog[] = eventsData?.events || [];

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = events.slice(startIndex, startIndex + itemsPerPage);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  
  const formatBlockNumber = (blockNum: string) => {
    const num = parseInt(blockNum, 16) || parseInt(blockNum);
    return num.toLocaleString();
  };

  const getEventSignature = (topics: string[]) => {
    if (!topics || topics.length === 0) return "Unknown Event";
    
    const firstTopic = topics[0];
    
    // Common event signatures
    const knownEvents: Record<string, string> = {
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": "Transfer",
      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": "Approval",
      "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c": "Deposit",
      "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65": "Withdrawal",
      "0xa4c82c73e4d7bc9e7ad8b3b3ec2c8b3c3f7c1e9a5e8b2e3d9e8b4c7a9d3c3c7": "Swap",
    };

    return knownEvents[firstTopic] || "Contract Event";
  };

  if (isLoading) {
    return (
      <Card className="ot-card-glass ot-border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-space">
            <Activity className="w-5 h-5 text-origin-teal" />
            Event Logs
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
            <Activity className="w-5 h-5 text-origin-teal" />
            Event Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-destructive font-space">Failed to load event logs</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {error instanceof Error ? error.message : "Unable to fetch event logs"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events.length) {
    return (
      <Card className="ot-card-glass ot-border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-space">
            <Activity className="w-5 h-5 text-origin-teal" />
            Event Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-space">No event logs found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              No contract events detected in blocks {startBlock} - {endBlock}
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
          <Activity className="w-5 h-5 text-origin-teal" />
          Event Logs
          <Badge variant="secondary" className="ml-auto">
            {events.length} events
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Contract events and logs from blocks {formatBlockNumber(startBlock)} - {formatBlockNumber(endBlock)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedEvents.map((event, index) => (
            <div key={`${event.transactionHash}-${event.logIndex}-${index}`} 
                 className="p-4 rounded-lg border border-border/30 hover:bg-secondary/5 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getEventSignature(event.topics)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Block {formatBlockNumber(event.blockNumber)}
                  </Badge>
                </div>
                <a
                  href={`https://etherscan.io/tx/${event.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`link-tx-${event.transactionHash}`}
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Transaction:</span>
                    <span className="font-mono">{formatHash(event.transactionHash)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Contract:</span>
                    <span className="font-mono">{formatAddress(event.address)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Log Index:</span>
                    <span className="ml-2 font-mono">{parseInt(event.logIndex, 16) || event.logIndex}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Topics:</span>
                    <span className="ml-2 font-mono">{event.topics.length}</span>
                  </div>
                </div>
              </div>

              {/* Event Topics */}
              {event.topics && event.topics.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="text-xs text-muted-foreground mb-2">Event Topics:</div>
                  <div className="space-y-1">
                    {event.topics.slice(0, 3).map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Topic {topicIndex}:</span>
                        <span className="font-mono bg-secondary/20 px-2 py-1 rounded">
                          {formatHash(topic)}
                        </span>
                      </div>
                    ))}
                    {event.topics.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{event.topics.length - 3} more topics
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Data */}
              {event.data && event.data !== "0x" && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="text-xs text-muted-foreground mb-2">Event Data:</div>
                  <div className="bg-secondary/10 rounded p-2">
                    <span className="font-mono text-xs break-all">
                      {event.data.length > 100 ? `${event.data.slice(0, 100)}...` : event.data}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, events.length)} of {events.length}
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