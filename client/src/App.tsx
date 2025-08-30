import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LatestBlocks from "./pages/LatestBlocks";
import LatestTransactions from "./pages/LatestTransactions";
import TokenTracker from "./pages/TokenTracker";
import WalletAnalyzer from "./pages/WalletAnalyzer";
import APIDocs from "./pages/APIDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/latest-blocks" element={<LatestBlocks />} />
          <Route path="/latest-transactions" element={<LatestTransactions />} />
          <Route path="/token-tracker" element={<TokenTracker />} />
          <Route path="/wallet-analyzer" element={<WalletAnalyzer />} />
          <Route path="/api-docs" element={<APIDocs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
