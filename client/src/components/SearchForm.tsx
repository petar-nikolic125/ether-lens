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
      <div className="ot-card rounded-2xl p-6 hover-lift">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Address */}
            <div className="lg:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium mb-2 font-space">
                Ethereum Address
              </label>
              <input
                  id="address"
                  type="text"
                  placeholder="Search by Address / Txn Hash / Block / Token"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="ot-input h-11 text-sm w-full"
              />
            </div>

            {/* Start block */}
            <div>
              <label htmlFor="startBlock" className="block text-sm font-medium mb-2 font-space">
                Starting Block
              </label>
              <input
                  id="startBlock"
                  type="text"
                  placeholder="9000000"
                  value={startBlock}
                  onChange={(e) => setStartBlock(e.target.value)}
                  className="ot-input h-11 text-sm w-full"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-start">
            <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary px-6 py-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Searching...
                  </>
              ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
  );
};
