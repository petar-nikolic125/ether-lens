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

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
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
    await new Promise((r) => setTimeout(r, 1500)); // simulate API delay
    onSearch({ address, startBlock });
    setIsLoading(false);

    toast({
      title: "Analysis Started",
      description: `Neural analysis initiated for ${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  };

  return (
      <div className="ot-card-glass rounded-3xl p-8 hover-lift ot-border-gradient">
        {/* Heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-origin-purple animate-glow" />
            <h2 className="text-2xl font-bold font-space ot-gradient-text">
              Neural Transaction Analysis
            </h2>
            <Sparkles className="w-6 h-6 text-origin-cyan animate-glow" style={{ animationDelay: "1s" }} />
          </div>
          <p className="text-muted-foreground font-inter">
            Enter wallet address and starting block to begin exploration
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Address */}
            <div className="lg:col-span-2 space-y-3">
              <label htmlFor="address" className="text-sm font-medium flex items-center gap-2 font-space">
                <Wallet className="w-4 h-4 text-origin-purple" />
                Ethereum Wallet Address
              </label>
              <Input
                  id="address"
                  type="text"
                  placeholder="0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="ot-input h-12 text-base"
              />
              <p className="text-xs text-muted-foreground/80">Address to analyze</p>
            </div>

            {/* Start block */}
            <div className="space-y-3">
              <label htmlFor="startBlock" className="text-sm font-medium flex items-center gap-2 font-space">
                <Hash className="w-4 h-4 text-origin-cyan" />
                Starting Block
              </label>
              <Input
                  id="startBlock"
                  type="text"
                  placeholder="9000000"
                  value={startBlock}
                  onChange={(e) => setStartBlock(e.target.value)}
                  className="ot-input h-12 text-base"
              />
              <p className="text-xs text-muted-foreground/80">Block number where analysis begins</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <Button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary rounded-pill px-10 py-4 text-lg font-semibold font-space disabled:opacity-50"
            >
              {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span className="ml-2">Neural Analysis in Progress…</span>
                  </>
              ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Begin Neural Analysis
                  </>
              )}
            </Button>
          </div>
        </form>
      </div>
  );
};
