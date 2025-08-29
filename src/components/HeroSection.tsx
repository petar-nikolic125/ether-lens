export const HeroSection = () => {
  return (
    <header className="text-center mb-16 relative">
      <div className="relative z-10">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 font-space">
          <span className="bg-gradient-primary bg-clip-text text-transparent animate-glow">
            Ethereum Activity Explorer
          </span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-4xl mx-auto leading-relaxed mb-8">
          Explore Ethereum blockchain transactions with advanced neural-symbolic analysis. 
          Track wallet activities, visualize ETH flows, and discover patterns in the decentralized ecosystem.
        </p>
        
        {/* Decorative Elements */}
        <div className="flex justify-center items-center space-x-8 opacity-60">
          <div className="w-2 h-2 bg-origin-purple rounded-full animate-pulse-slow" />
          <div className="w-1 h-1 bg-origin-cyan rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="w-2 h-2 bg-origin-teal rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
      </div>
      
      {/* Neural Network Background Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(280 100% 65%)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(180 100% 50%)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(170 100% 45%)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Neural Network Lines */}
          <g stroke="url(#neuralGradient)" strokeWidth="1" fill="none">
            <path d="M100,200 Q200,100 300,200 T500,200" className="animate-pulse-slow" />
            <path d="M150,250 Q250,150 350,250 T550,250" className="animate-pulse-slow" style={{ animationDelay: '1s' }} />
            <path d="M200,150 Q300,250 400,150 T600,150" className="animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </g>
          
          {/* Neural Nodes */}
          <g fill="url(#neuralGradient)">
            <circle cx="100" cy="200" r="3" className="animate-pulse-slow" />
            <circle cx="300" cy="200" r="4" className="animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
            <circle cx="500" cy="200" r="3" className="animate-pulse-slow" style={{ animationDelay: '1s' }} />
            <circle cx="350" cy="250" r="3" className="animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            <circle cx="400" cy="150" r="4" className="animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </g>
        </svg>
      </div>
    </header>
  );
};