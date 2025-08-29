import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { StatsGrid } from "@/components/StatsGrid";
import { TransactionList } from "@/components/TransactionList";
import { BalanceChart } from "@/components/BalanceChart";
import { NetworkStats } from "@/components/NetworkStats";
import { HeroSection } from "@/components/HeroSection";
import { Header } from "@/components/Header";

const Index = () => {
  const [searchData, setSearchData] = useState<{ address: string; startBlock: string } | null>(null);

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Network Stats */}
        <NetworkStats />

        {/* Search Form */}
        <div className="mb-12">
          <SearchForm onSearch={setSearchData} />
        </div>

        {searchData ? (
          <>
            {/* Stats Grid */}
            <StatsGrid address={searchData.address} startBlock={searchData.startBlock} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <BalanceChart address={searchData.address} />
              <div className="ot-card">
                <h3 className="text-xl font-semibold mb-4 font-space">Transaction Volume</h3>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full animate-pulse-slow flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    </div>
                    <p className="font-space">Volume analytics loading...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <TransactionList address={searchData.address} startBlock={searchData.startBlock} />
          </>
        ) : (
          /* Welcome Section */
          <div className="text-center py-16">
            <div className="ot-card-glass max-w-4xl mx-auto hover-lift">
              <h2 className="text-3xl font-bold mb-6 font-space ot-gradient-text">
                The Ethereum Blockchain Explorer
              </h2>
              <p className="text-muted-foreground mb-12 text-lg max-w-3xl mx-auto leading-relaxed font-inter">
                Advanced blockchain analysis powered by OriginTrail's neural network infrastructure.
                Explore transactions, track balances, and discover insights across the Ethereum ecosystem.
              </p>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground/70 font-inter">
                  Enter a wallet address above to begin your blockchain analysis
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;