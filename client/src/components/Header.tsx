import React from "react";
import { Search, ChevronDown, Bell, User, Home, Activity, Database, Coins, FileText, HelpCircle, Settings } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="bg-background border-b border-border/20">
      {/* Top bar with ETH price */}
      <div className="bg-secondary/30 border-b border-border/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-inter">ETH Price:</span>
                <span className="text-success font-semibold">$4,361.44</span>
                <span className="text-success text-xs">(+1.8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-inter">Gas:</span>
                <span className="text-foreground">5 Gwei</span>
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
              <span className="font-space font-bold text-xl text-foreground">Etherscan</span>
            </div>

            {/* Navigation links */}
            <nav className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Home className="w-4 h-4" />
                <span className="font-inter">Home</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Database className="w-4 h-4" />
                <span className="font-inter">Blockchain</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Coins className="w-4 h-4" />
                <span className="font-inter">Tokens</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <FileText className="w-4 h-4" />
                <span className="font-inter">NFTs</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Activity className="w-4 h-4" />
                <span className="font-inter">Resources</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Settings className="w-4 h-4" />
                <span className="font-inter">Developers</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <span className="font-inter">More</span>
                <ChevronDown className="w-3 h-3" />
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
          <h1 className="text-2xl font-bold font-space text-foreground">The Ethereum Blockchain Explorer</h1>
        </div>
      </div>
    </header>
  );
};