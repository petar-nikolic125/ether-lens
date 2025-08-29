import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Wallet, Hash, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SearchFormProps {
  onSearch: (data: { address: string; startBlock: string }) => void;
}

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [address, setAddress] = useState("");
  const [startBlock, setStartBlock] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !startBlock) {
      toast({
        title: "Missing Information",
        description: "Please enter both wallet address and starting block number.",
        variant: "destructive",
      });
      return;
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum wallet address.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(Number(startBlock)) || Number(startBlock) < 0) {
      toast({
        title: "Invalid Block Number",
        description: "Please enter a valid block number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSearch({ address, startBlock });
    setIsLoading(false);
    
    toast({
      title: "Analysis Started",
      description: `Neural analysis initiated for ${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  };

  return (
    <div className="glass-card rounded-3xl p-8 transition-glass hover:shadow-neural">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-origin-purple animate-glow" />
          <h2 className="text-2xl font-bold font-space bg-gradient-primary bg-clip-text text-transparent">
            Neural Transaction Analysis
          </h2>
          <Sparkles className="w-6 h-6 text-origin-cyan animate-glow" style={{ animationDelay: '1s' }} />
        </div>
        <p className="text-muted-foreground">
          Enter wallet address and starting block to begin comprehensive blockchain exploration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Address Input */}
          <div className="lg:col-span-2 space-y-3">
            <label htmlFor="address" className="text-sm font-medium flex items-center gap-2 font-space">
              <Wallet className="w-4 h-4 text-origin-purple" />
              Ethereum Wallet Address
            </label>
            <div className="relative">
              <Input
                id="address"
                type="text"
                placeholder="0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="glass h-12 text-lg border-border/30 focus:border-origin-purple/50 focus:ring-origin-purple/20 transition-glass"
              />
              <div className="absolute inset-0 bg-gradient-border opacity-0 hover:opacity-20 rounded-lg pointer-events-none transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground/80">
              Enter the Ethereum wallet address you want to analyze
            </p>
          </div>

          {/* Start Block Input */}
          <div className="space-y-3">
            <label htmlFor="startBlock" className="text-sm font-medium flex items-center gap-2 font-space">
              <Hash className="w-4 h-4 text-origin-cyan" />
              Starting Block
            </label>
            <div className="relative">
              <Input
                id="startBlock"
                type="text"
                placeholder="9000000"
                value={startBlock}
                onChange={(e) => setStartBlock(e.target.value)}
                className="glass h-12 text-lg border-border/30 focus:border-origin-cyan/50 focus:ring-origin-cyan/20 transition-glass"
              />
              <div className="absolute inset-0 bg-gradient-border opacity-0 hover:opacity-20 rounded-lg pointer-events-none transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground/80">
              Block number to start analysis from
            </p>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-primary text-primary-foreground px-12 py-4 text-lg font-semibold font-space
                     hover:shadow-neural transition-neural disabled:opacity-50 rounded-2xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-3">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Neural Analysis in Progress...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Begin Neural Analysis
                </>
              )}
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
};