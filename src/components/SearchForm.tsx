import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Wallet, Hash } from "lucide-react";
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSearch({ address, startBlock });
    setIsLoading(false);
    
    toast({
      title: "Search Started",
      description: `Analyzing transactions for ${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  };

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-border shadow-card">
      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Address Input */}
          <div className="lg:col-span-2 space-y-2">
            <label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4 text-ethereum" />
              Wallet Address
            </label>
            <Input
              id="address"
              type="text"
              placeholder="0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-background/50 border-border shadow-input focus:ring-ethereum focus:border-ethereum"
            />
            <p className="text-xs text-muted-foreground">
              Enter the Ethereum wallet address you want to analyze
            </p>
          </div>

          {/* Start Block Input */}
          <div className="space-y-2">
            <label htmlFor="startBlock" className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4 text-chart-2" />
              Starting Block
            </label>
            <Input
              id="startBlock"
              type="text"
              placeholder="9000000"
              value={startBlock}
              onChange={(e) => setStartBlock(e.target.value)}
              className="bg-background/50 border-border shadow-input focus:ring-chart-2 focus:border-chart-2"
            />
            <p className="text-xs text-muted-foreground">
              Block number to start analysis from
            </p>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-primary text-primary-foreground px-8 py-3 text-lg font-semibold
                     hover:shadow-glow transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Analyze Address
              </div>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};