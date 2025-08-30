import React, { useState, useEffect } from "react";
import { Search, Home, Activity, Database, Coins, FileText, HelpCircle, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export const Header: React.FC = () => {
  const location = useLocation();
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Check if MetaMask is available
  const isMetaMaskAvailable = typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';

  // Check for existing connection on load
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskAvailable) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.log('Not connected to MetaMask');
        }
      }
    };
    checkConnection();
  }, [isMetaMaskAvailable]);

  const connectWallet = async () => {
    if (!isMetaMaskAvailable) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    setAccount(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected"
    });
  };


  return (
    <header className="bg-background border-b border-border/20">
      {/* Main navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">OT</span>
              </div>
              <span className="font-space font-bold text-xl text-foreground">OriginTrail Explorer</span>
            </div>

            {/* Navigation links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className={`flex items-center gap-1 transition-colors ${isActive('/') ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-home">
                <Home className="w-4 h-4" />
                <span className="font-inter">Home</span>
              </Link>
              
              <Link to="/latest-blocks" className={`flex items-center gap-1 transition-colors ${isActive('/latest-blocks') ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-latest-blocks">
                <Database className="w-4 h-4" />
                <span className="font-inter">Latest Blocks</span>
              </Link>

              <Link to="/latest-transactions" className={`flex items-center gap-1 transition-colors ${isActive('/latest-transactions') ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-latest-transactions">
                <Activity className="w-4 h-4" />
                <span className="font-inter">Latest Transactions</span>
              </Link>

              <Link to="/token-tracker" className={`flex items-center gap-1 transition-colors ${isActive('/token-tracker') ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-token-tracker">
                <Coins className="w-4 h-4" />
                <span className="font-inter">Token Tracker</span>
              </Link>

              <Link to="/wallet-analyzer" className={`flex items-center gap-1 transition-colors ${isActive('/wallet-analyzer') ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-wallet-analyzer">
                <FileText className="w-4 h-4" />
                <span className="font-inter">Wallet Analyzer</span>
              </Link>

              <Link to="/api-docs" className={`flex items-center gap-1 transition-colors ${isActive('/api-docs') ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-api-docs">
                <HelpCircle className="w-4 h-4" />
                <span className="font-inter">API Docs</span>
              </Link>
            </nav>
          </div>

          {/* Search and Sign In */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Address / Txn Hash / Block / Token"
                className="ot-input w-80 pl-10 pr-4 py-2 text-sm"
              />
            </div>
            {account ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm text-primary">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="btn btn-outline text-sm px-3 py-2"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-3 border-t border-border/10">
          <h1 className="text-2xl font-bold font-space text-foreground">Ethereum Transaction Crawler</h1>
        </div>
      </div>
    </header>
  );
};