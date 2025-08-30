import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { StatsGrid } from "@/components/StatsGrid";
import { TransactionList } from "@/components/TransactionList";
import { BalanceChart } from "@/components/BalanceChart";
import { NetworkStats } from "@/components/NetworkStats";
import { HeroSection } from "@/components/HeroSection";
import { Header } from "@/components/Header";
import { EthereumDashboard } from "@/components/EthereumDashboard";
import { HistoricalBalance } from "@/components/HistoricalBalance";
import { TokenTransfers } from "@/components/TokenTransfers";
import { TransactionVolumeChart } from "@/components/TransactionVolumeChart";

const Index = () => {
  const [searchData, setSearchData] = useState<{ address: string; startBlock: string } | null>(null);

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <Header />
      
      {/* Hero Section with Trust the Source */}
      <HeroSection onSearch={setSearchData} />

      {/* Search-based Analysis (when user searches) - Right after search form */}
      {searchData && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-bold mb-8 font-space">Wallet Analysis Results</h2>
            
            {/* Stats Grid */}
            <StatsGrid address={searchData.address} startBlock={searchData.startBlock} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <BalanceChart address={searchData.address} />
              <TransactionVolumeChart address={searchData.address} startBlock={searchData.startBlock} />
            </div>

            {/* Transaction List */}
            <TransactionList address={searchData.address} startBlock={searchData.startBlock} />

            {/* Bonus Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              {/* Historical Balance Lookup */}
              <HistoricalBalance address={searchData.address} />
              
              {/* Token Transfers */}
              <div className="lg:col-span-2">
                <TokenTransfers address={searchData.address} startBlock={searchData.startBlock} />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Ethereum Dashboard - Main Content */}
      <EthereumDashboard />

    </div>
  );
};

export default Index;