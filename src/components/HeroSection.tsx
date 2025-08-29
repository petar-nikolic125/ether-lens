import React from "react";

export const HeroSection: React.FC = () => {
  return (
      <header
          className="relative overflow-hidden pt-0 pb-16 md:pb-20"
          aria-label="Hero: Trust the Source"
      >
        {/* ===== Banner: TRUST THE SOURCE ===== */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
              className="
            relative overflow-hidden rounded-3xl border border-border/50
            bg-[hsl(var(--background))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06)]
          "
          >
            {/* Decorative top purple rim glow */}
            <div
                className="pointer-events-none absolute -top-24 left-0 right-0 h-48 blur-2xl opacity-70"
                style={{
                  background:
                      "radial-gradient(120% 100% at 50% 0%, hsl(var(--origin-purple)/.4), transparent 60%)",
                }}
                aria-hidden="true"
            />

            {/* “Star dust” speckles */}
            <div
                className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen"
                aria-hidden="true"
            >
              <div
                  className="
                absolute inset-0
                bg-[radial-gradient(2px_2px_at_20%_40%,hsl(var(--foreground)/.18),transparent_40%),radial-gradient(1px_1px_at_70%_20%,hsl(var(--foreground)/.18),transparent_40%),radial-gradient(1.5px_1.5px_at_60%_70%,hsl(var(--foreground)/.15),transparent_40%)]
              "
              />
            </div>

            {/* Spotlight cone */}
            <div
                className="pointer-events-none absolute -top-1/2 left-1/2 h-[220%] w-[72%] -translate-x-1/2 rotate-[2deg] blur-[18px] opacity-90"
                aria-hidden="true"
            >
              <div
                  className="absolute inset-0"
                  style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, hsl(var(--origin-purple)/.92) 0%, hsl(var(--origin-purple)/.45) 20%, transparent 55%)",
                  }}
              />
              {/* Soft secondary bloom */}
              <div
                  className="absolute inset-0"
                  style={{
                    background:
                        "radial-gradient(ellipse at 50% 25%, hsl(var(--origin-cyan)/.20) 0%, transparent 60%)",
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
              <h1 className="sr-only">Trust the Source</h1>
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
        </div>
      </header>
  );
};
