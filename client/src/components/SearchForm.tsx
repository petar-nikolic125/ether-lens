import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Wallet, Hash, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SearchFormProps {
  onSearch: (data: { address: string; startBlock: string }) => void;
}

// Famous wallet addresses for testing and demo purposes
const FAMOUS_WALLETS = [
  { name: "OriginTrail (TRAC) Token", address: "0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f", startBlock: "4718084" },
  { name: "OriginTrail Foundation Treasury", address: "0x67df244584b67e8c51b10ad610aaffa9a402fdb6", startBlock: "7500000" },
  { name: "OriginTrail Treasury: Locked", address: "0x237343c10705ae7605850977503e25a8c12851e6", startBlock: "8000000" },
  { name: "Ethereum Foundation", address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe", startBlock: "46147" },
  { name: "Binance Hot Wallet", address: "0x28C6c06298d514Db089934071355E5743bf21d60", startBlock: "4634748" },
  { name: "Coinbase 14", address: "0x71660c4005BA85c37ccec55d0C4493E66Fe775d3", startBlock: "3327231" },
  { name: "Kraken Exchange", address: "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2", startBlock: "3040196" },
  { name: "BitMEX Exchange", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", startBlock: "5969946" },
  { name: "Uniswap V3 Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", startBlock: "12369621" },
  { name: "MetaMask Swap Router", address: "0x1a1ec25DC08e98e5E93F1104B5e5cdD298707d31", startBlock: "10861674" },
  { name: "OpenSea Registry", address: "0xa5409ec958C83C3f309868babACA7c86DCB077c1", startBlock: "5774644" },
  { name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", startBlock: "4719568" },
  { name: "USDC Token Contract", address: "0xA0b86a33E6Eb3976d6769A8B6C292D59C25eE5dB", startBlock: "6082465" }
];

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [address, setAddress] = useState("");
  const [startBlock, setStartBlock] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    
    try {
      // Call the API to start transaction fetching
      const response = await fetch(`/api/wallet/${address}/transactions?startBlock=${startBlock}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transactions');
      }

      onSearch({ address, startBlock });
      
      toast({
        title: "Analysis Complete",
        description: `Successfully loaded transactions for ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to fetch transaction data",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleWalletSelect = (wallet: typeof FAMOUS_WALLETS[0]) => {
    setAddress(wallet.address);
    setStartBlock(wallet.startBlock);
    setShowSuggestions(false);
  };

  return (
      <div className="ot-card rounded-2xl p-6 hover-lift">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Address */}
            <div className="lg:col-span-2 relative" ref={dropdownRef}>
              <label htmlFor="address" className="block text-sm font-medium mb-2 font-space">
                Ethereum Address
              </label>
              <div className="relative">
                <input
                    id="address"
                    type="text"
                    placeholder="0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="ot-input h-11 text-sm w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              
              {/* Famous Wallets Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 border-b border-border">
                    <div className="text-xs text-muted-foreground font-medium">Famous Wallets for Testing</div>
                  </div>
                  <div className="p-1">
                    {FAMOUS_WALLETS.map((wallet, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleWalletSelect(wallet)}
                        className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="text-sm font-medium">{wallet.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}</div>
                        <div className="text-xs text-muted-foreground">Block #{wallet.startBlock}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
