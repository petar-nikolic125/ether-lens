import React from "react";
import { LimitlessVisualizer } from "./LimitlessVisualizer";

export const HeroSection: React.FC = () => {
  return (
    <header className="relative overflow-hidden bg-background">
      {/* LIMITLESS Section */}
      <div className="relative h-[60vh] md:h-[70vh] flex items-center justify-center">
        {/* Background visualizer */}
        <div className="absolute inset-0">
          <LimitlessVisualizer />
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* LIMITLESS text */}
        <div className="relative z-10 text-center">
          <h1 className="font-space text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-wider">
            LIMITLESS
          </h1>
        </div>

        {/* Navigation dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          <div className="w-2 h-2 rounded-full bg-white/60" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Harmony Section */}
      <div className="relative py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-space text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8">
            ETHEREUM BLOCKCHAIN EXPLORER
          </h2>
          
          <p className="font-inter text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed">
            Advanced transaction crawler and visualization tool for Ethereum blockchain analysis. 
            Track wallet activities, analyze transaction flows, and explore blockchain data with powerful insights.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center neural-glow">
                <span className="text-2xl font-bold text-primary-foreground">∞</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-space">Complete Transaction History</h3>
              <p className="text-muted-foreground text-sm font-inter">
                Crawl and analyze all transactions from any starting block to current
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-border rounded-2xl flex items-center justify-center neural-glow">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-space">Visual Analytics</h3>
              <p className="text-muted-foreground text-sm font-inter">
                Interactive charts and comprehensive transaction visualizations
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-glass rounded-2xl flex items-center justify-center neural-glow">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-space">Deep Wallet Analysis</h3>
              <p className="text-muted-foreground text-sm font-inter">
                Comprehensive insights into wallet behavior and ETH flows
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="ot-divider mx-auto max-w-7xl mt-20" />
      </div>
    </header>
  );
};