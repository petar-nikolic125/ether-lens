import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, FileText, Globe, Key, Database, Zap } from "lucide-react";

const APIDocs = () => {
  const endpoints = [
    {
      method: "GET",
      path: "/api/wallet/{address}/transactions",
      description: "Get all transactions for a wallet address",
      params: ["address (required)", "startBlock (optional)"],
      response: "Transaction list with stats and metadata"
    },
    {
      method: "GET", 
      path: "/api/wallet/{address}/balance",
      description: "Get current wallet balance",
      params: ["address (required)"],
      response: "Current balance in Wei and ETH"
    },
    {
      method: "GET",
      path: "/api/wallet/{address}/balance-at-date",
      description: "Get historical balance at specific date",
      params: ["address (required)", "date (YYYY-MM-DD)"],
      response: "Balance at specified date and block"
    },
    {
      method: "GET",
      path: "/api/wallet/{address}/tokens",
      description: "Get ERC-20 token transfers for address",
      params: ["address (required)", "startBlock (optional)"],
      response: "List of token transfers"
    },
    {
      method: "GET",
      path: "/api/latest-blocks",
      description: "Get latest Ethereum blocks",
      params: [],
      response: "Array of recent blocks with metadata"
    },
    {
      method: "GET",
      path: "/api/latest-transactions",
      description: "Get latest network transactions",
      params: [],
      response: "Array of recent transactions"
    },
    {
      method: "GET",
      path: "/api/network-stats",
      description: "Get current network statistics",
      params: [],
      response: "ETH price, gas price, latest block info"
    },
    {
      method: "GET",
      path: "/api/eth-price-history",
      description: "Get ETH price history for charts",
      params: ["days (optional, default: 7)"],
      response: "Historical price data"
    }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-space text-foreground mb-2">API Documentation</h1>
          <p className="text-muted-foreground">Complete reference for the Ethereum Transaction Crawler API</p>
        </div>

        {/* Overview */}
        <Card className="ot-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              API Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The Ethereum Transaction Crawler API provides comprehensive access to Ethereum blockchain data, 
              including wallet analysis, transaction tracking, and network statistics.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <Database className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Real-time Data</h3>
                <p className="text-sm text-muted-foreground">Live blockchain data via Etherscan API</p>
              </div>
              
              <div className="text-center p-4 border border-border rounded-lg">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Fast Response</h3>
                <p className="text-sm text-muted-foreground">Optimized endpoints with caching</p>
              </div>
              
              <div className="text-center p-4 border border-border rounded-lg">
                <Key className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Secure Access</h3>
                <p className="text-sm text-muted-foreground">Rate-limited and validated requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Base URL */}
        <Card className="ot-card mb-8">
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              {window.location.origin}/api
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-space">API Endpoints</h2>
          
          {endpoints.map((endpoint, index) => (
            <Card key={index} className="ot-card" data-testid={`endpoint-${index}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{endpoint.description}</p>
                
                {endpoint.params.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Parameters:</h4>
                    <ul className="space-y-1">
                      {endpoint.params.map((param, i) => (
                        <li key={i} className="text-sm">
                          <code className="bg-muted px-2 py-1 rounded">{param}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <p className="text-sm text-muted-foreground">{endpoint.response}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Examples */}
        <Card className="ot-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Example Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Get wallet transactions:</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                GET /api/wallet/0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f/transactions?startBlock=9000000
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Get balance at specific date:</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                GET /api/wallet/0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f/balance-at-date?date=2023-01-01
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Get token transfers:</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                GET /api/wallet/0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f/tokens?startBlock=19000000
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Handling */}
        <Card className="ot-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Error Handling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The API returns standard HTTP status codes and JSON error responses:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="destructive">400</Badge>
                <span className="text-sm">Bad Request - Invalid parameters</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="destructive">404</Badge>
                <span className="text-sm">Not Found - Resource doesn't exist</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="destructive">500</Badge>
                <span className="text-sm">Internal Server Error - API or blockchain error</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default APIDocs;