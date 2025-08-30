import React, { useState } from "react";
import { LimitlessVisualizer } from "./LimitlessVisualizer";
import { SearchForm } from "./SearchForm";

interface HeroSectionProps {
  onSearch?: (data: { address: string; startBlock: string }) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  return (
    <header className="relative overflow-hidden bg-background">
      {/* Trust the Source Hero Section */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-[hsl(var(--background))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06)]">
          {/* Background visualizer - compact */}
          <div className="absolute inset-0 opacity-60">
            <LimitlessVisualizer />
          </div>

          {/* Decorative top purple rim glow */}
          <div
            className="pointer-events-none absolute -top-24 left-0 right-0 h-48 blur-2xl opacity-70"
            style={{
              background: "radial-gradient(120% 100% at 50% 0%, hsl(var(--origin-purple)/.4), transparent 60%)",
            }}
            aria-hidden="true"
          />

          {/* Spotlight cone */}
          <div
            className="pointer-events-none absolute -top-1/2 left-1/2 h-[220%] w-[72%] -translate-x-1/2 rotate-[2deg] blur-[18px] opacity-90"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, hsl(var(--origin-purple)/.92) 0%, hsl(var(--origin-purple)/.45) 20%, transparent 55%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at 50% 25%, hsl(var(--origin-cyan)/.20) 0%, transparent 60%)",
              }}
            />
          </div>

          {/* Vignette to keep edges dark */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_50%,transparent_60%,_hsl(var(--background))_100%)]"
            aria-hidden="true"
          />

          {/* Text */}
          <div className="relative z-10">
            <div className="py-10 md:py-14 flex items-center justify-center gap-5 md:gap-7">
              <span className="font-space text-white text-4xl md:text-6xl font-extrabold tracking-[0.18em]">
                TRUST
              </span>
              <span
                className="
                  font-space text-white text-4xl md:text-6xl font-extrabold tracking-[0.18em]
                  transform-gpu [transform:perspective(950px)_rotateX(14deg)]
                  drop-shadow-[0_22px_42px_hsl(var(--origin-purple)/.70)]
                "
              >
                THE
              </span>
              <span className="font-space text-white text-4xl md:text-6xl font-extrabold tracking-[0.18em]">
                SOURCE
              </span>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-center mt-8 mb-12">
          <p className="font-inter text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced Ethereum blockchain explorer and transaction crawler. 
            Analyze wallet activities and explore transaction flows with comprehensive insights.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto mb-16">
          {onSearch && <SearchForm onSearch={onSearch} />}
        </div>

        {/* Divider */}
        <div className="ot-divider mx-auto max-w-4xl" />
      </div>
    </header>
  );
};