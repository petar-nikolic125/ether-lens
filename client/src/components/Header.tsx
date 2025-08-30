import React, { useEffect } from "react";
import { Search, ChevronDown, Bell, User, Home, Activity, Database, Coins, FileText, HelpCircle, Settings } from "lucide-react";

export const Header: React.FC = () => {
  // Update header with live data
  useEffect(() => {
    const updateHeaderData = async () => {
      try {
        const response = await fetch('/api/network-stats');
        const data = await response.json();
        
        if (data.stats) {
          const ethPriceElement = document.getElementById('eth-price');
          const gasPriceElement = document.getElementById('gas-price');
          
          const ethPriceStat = data.stats.find((stat: any) => stat.title === 'ETHER PRICE');
          const gasPriceStat = data.stats.find((stat: any) => stat.title === 'GAS PRICE');
          
          if (ethPriceElement && ethPriceStat) {
            ethPriceElement.textContent = ethPriceStat.value;
          }
          
          if (gasPriceElement && gasPriceStat) {
            gasPriceElement.textContent = gasPriceStat.value;
          }
        }
      } catch (error) {
        console.error('Failed to update header data:', error);
      }
    };

    updateHeaderData();
    const interval = setInterval(updateHeaderData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-background border-b border-border/20">
      {/* Top bar with ETH price */}
      <div className="bg-secondary/30 border-b border-border/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-inter">ETH Price:</span>
                <span className="text-success font-semibold" id="eth-price">Loading...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-inter">Gas:</span>
                <span className="text-foreground" id="gas-price">Loading...</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

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
              <div className="flex items-center gap-1 text-foreground font-semibold cursor-pointer">
                <Home className="w-4 h-4" />
                <span className="font-inter">Home</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Database className="w-4 h-4" />
                <span className="font-inter">Latest Blocks</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Activity className="w-4 h-4" />
                <span className="font-inter">Latest Transactions</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Coins className="w-4 h-4" />
                <span className="font-inter">Token Tracker</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <FileText className="w-4 h-4" />
                <span className="font-inter">Wallet Analyzer</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <HelpCircle className="w-4 h-4" />
                <span className="font-inter">API Docs</span>
              </div>
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
            <button className="btn btn-primary text-sm px-4 py-2">
              Sign In
            </button>
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