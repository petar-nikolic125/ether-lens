import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { StatsGrid } from "@/components/StatsGrid";
import { TransactionList } from "@/components/TransactionList";
import { BalanceChart } from "@/components/BalanceChart";
import { NetworkStats } from "@/components/NetworkStats";
import { HeroSection } from "@/components/HeroSection";

const Index = () => {
  const [searchData, setSearchData] = useState<{ address: string; startBlock: string } | null>(null);

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-neural opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-origin-purple/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-origin-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection />

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
              <div className="glass-card rounded-2xl p-6 transition-glass hover:shadow-neural">
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
            <div className="glass-card rounded-3xl p-12 max-w-4xl mx-auto transition-glass hover:shadow-neural">
              <h2 className="text-3xl font-bold mb-6 font-space bg-gradient-primary bg-clip-text text-transparent">
                Harmony of Facts and Creativity
              </h2>
              <p className="text-muted-foreground mb-12 text-lg max-w-3xl mx-auto leading-relaxed">
                Collective neuro-symbolic blockchain analysis combines structured and connected information 
                from Ethereum transactions with the creativity of advanced visualization technologies, 
                building a robust decentralized transaction infrastructure.
              </p>
              
              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center neural-glow group-hover:animate-glow transition-neural">
                    <div className="text-3xl font-bold text-primary-foreground">∞</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-space">Unlimited History</h3>
                  <p className="text-muted-foreground text-sm">Complete transaction history from any starting block</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-border rounded-2xl flex items-center justify-center neural-glow group-hover:animate-glow transition-neural" style={{ animationDelay: '0.2s' }}>
                    <div className="text-3xl">📊</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-space">Visual Analytics</h3>
                  <p className="text-muted-foreground text-sm">Advanced charts and interactive visualizations</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-glass rounded-2xl flex items-center justify-center neural-glow group-hover:animate-glow transition-neural" style={{ animationDelay: '0.4s' }}>
                    <div className="text-3xl">🔍</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-space">Deep Insights</h3>
                  <p className="text-muted-foreground text-sm">Comprehensive wallet and token analysis</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground/70">
                  Start your blockchain analysis journey by entering a wallet address above
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;