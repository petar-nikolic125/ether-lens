import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { StatsGrid } from "@/components/StatsGrid";
import { TransactionList } from "@/components/TransactionList";
import { BalanceChart } from "@/components/BalanceChart";
import { NetworkStats } from "@/components/NetworkStats";

const Index = () => {
  const [searchData, setSearchData] = useState<{ address: string; startBlock: string } | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 -z-10" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Ethereum Activity Explorer
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore Ethereum blockchain transactions, track wallet activities, and analyze ETH flows with advanced visualization tools.
          </p>
        </header>

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
              <div className="bg-gradient-card backdrop-blur-sm rounded-2xl border border-border p-6 shadow-card">
                <h3 className="text-xl font-semibold mb-4">Transaction Volume</h3>
                <p className="text-muted-foreground">Volume chart coming soon...</p>
              </div>
            </div>

            {/* Transaction List */}
            <TransactionList address={searchData.address} startBlock={searchData.startBlock} />
          </>
        ) : (
          /* Welcome Section */
          <div className="text-center py-16">
            <div className="bg-gradient-card backdrop-blur-sm rounded-2xl border border-border p-12 shadow-card max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Start Your Blockchain Analysis</h2>
              <p className="text-muted-foreground mb-8">
                Enter an Ethereum wallet address and starting block to begin exploring transaction history, 
                balance changes, and token flows.
              </p>
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-ethereum">∞</div>
                  <div className="text-sm text-muted-foreground">Unlimited History</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chart-2">📊</div>
                  <div className="text-sm text-muted-foreground">Visual Analytics</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chart-3">🔍</div>
                  <div className="text-sm text-muted-foreground">Deep Insights</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;