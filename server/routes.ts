import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Load environment variables first, before any other imports
import { config } from "dotenv";
config();

// Etherscan API service
class EtherscanService {
  public baseUrl = "https://api.etherscan.io/v2/api";
  private apiKey = process.env.ETHERSCAN_API_KEY;
  private chainId = "1"; // Ethereum mainnet

  constructor() {
    if (!this.apiKey) {
      throw new Error("ETHERSCAN_API_KEY environment variable is required");
    }
  }

  // Secure method to build URLs with API key
  private buildUrl(baseParams: string): string {
    return `${this.baseUrl}?${baseParams}&apikey=${this.apiKey}`;
  }

  // Rate limiting helper
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Handle rate limit
        if (data.status === "0" && data.message?.includes("rate limit")) {
          console.warn("Rate limit hit, waiting 1 second...");
          await this.delay(1000);
          continue;
        }
        
        return data;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.delay(500);
      }
    }
  }

  async getTransactions(address: string, startBlock: number = 0, endBlock: number = 99999999) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=1000&sort=desc&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    // API response logging removed for security
    
    // Handle "No transactions found" case - this is normal and not an error
    if (data.status === "0" && data.message === "No transactions found") {
      return [];
    }
    
    if (data.status !== "1") {
      console.error("Etherscan API error - status:", data.status, "message:", data.message);
      throw new Error(data.message || data.result || "Failed to fetch transactions");
    }
    
    return data.result || [];
  }

  async getTokenTransfers(address: string, startBlock: number = 0) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=account&action=tokentx&address=${address}&startblock=${startBlock}&endblock=99999999&page=1&offset=1000&sort=desc&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    // API response logging removed for security
    
    // Handle "No transactions found" case - this is normal and not an error
    if (data.status === "0" && data.message === "No transactions found") {
      return [];
    }
    
    if (data.status !== "1") {
      console.error("Etherscan token API error - status:", data.status, "message:", data.message);
      throw new Error(data.message || data.result || "Failed to fetch token transfers");
    }
    
    return data.result || [];
  }

  async getBalance(address: string, blockNumber?: number) {
    const tag = blockNumber ? blockNumber.toString() : "latest";
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=account&action=balance&address=${address}&tag=${tag}&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    // API response logging removed for security
    
    if (data.status !== "1") {
      console.error("Etherscan balance API error - status:", data.status, "message:", data.message);
      throw new Error(data.message || data.result || "Failed to fetch balance");
    }
    
    return data.result;
  }

  async getBlockByTimestamp(timestamp: number, closest: "before" | "after" = "before") {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=block&action=getblocknobytime&timestamp=${timestamp}&closest=${closest}&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch block");
    }
    
    return parseInt(data.result);
  }

  // New V2 endpoints
  async getInternalTransactions(address: string, startBlock: number = 0, endBlock: number = 99999999) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=account&action=txlistinternal&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=100&sort=desc&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    if (data.status === "0" && data.message === "No transactions found") {
      return [];
    }
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch internal transactions");
    }
    
    return data.result || [];
  }

  async getNFTTransfers(address: string, startBlock: number = 0) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=account&action=tokennfttx&address=${address}&startblock=${startBlock}&endblock=99999999&page=1&offset=100&sort=desc&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    if (data.status === "0" && data.message === "No transactions found") {
      return [];
    }
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch NFT transfers");
    }
    
    return data.result || [];
  }

  async getERC1155Transfers(address: string, startBlock: number = 0) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=account&action=token1155tx&address=${address}&startblock=${startBlock}&endblock=99999999&page=1&offset=100&sort=desc&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    if (data.status === "0" && data.message === "No transactions found") {
      return [];
    }
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch ERC1155 transfers");
    }
    
    return data.result || [];
  }

  async getTransactionStatus(txHash: string) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=transaction&action=getstatus&txhash=${txHash}&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch transaction status");
    }
    
    return data.result;
  }

  async getTransactionReceipt(txHash: string) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    return data.result;
  }

  async getBlockReward(blockNumber: number) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=block&action=getblockreward&blockno=${blockNumber}&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch block reward");
    }
    
    return data.result;
  }

  async getLatestBlockNumber() {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=proxy&action=eth_blockNumber&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    if (!data.result) {
      throw new Error("Failed to fetch latest block number");
    }
    
    return parseInt(data.result, 16);
  }

  async getEventLogs(address: string, fromBlock: number, toBlock: number) {
    const url = `${this.baseUrl}?chainid=${this.chainId}&module=logs&action=getLogs&address=${address}&fromBlock=${fromBlock}&toBlock=${toBlock}&page=1&offset=1000&apikey=${this.apiKey}`;
    
    const data = await this.makeRequest(url);
    
    if (data.status === "0" && data.message === "No logs found") {
      return [];
    }
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch event logs");
    }
    
    return data.result || [];
  }
}

const etherscanService = new EtherscanService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Validation schemas
  const searchSchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    startBlock: z.string().transform(val => parseInt(val)).pipe(z.number().min(0)),
  });

  const balanceAtDateSchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  });

  // Get wallet transactions and stats
  app.get("/api/wallet/:address/transactions", async (req, res) => {
    try {
      const { address } = req.params;
      const { startBlock = "0" } = req.query;
      
      const validation = searchSchema.safeParse({ address, startBlock });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { address: validAddress, startBlock: validStartBlock } = validation.data;

      // Fetch transactions from Etherscan
      const transactions = await etherscanService.getTransactions(validAddress, validStartBlock);
      
      // Process and store transactions
      const processedTransactions = transactions.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: parseInt(tx.blockNumber),
        blockHash: tx.blockHash,
        fromAddress: tx.from.toLowerCase(),
        toAddress: tx.to?.toLowerCase() || null,
        value: tx.value,
        gasUsed: parseInt(tx.gasUsed),
        gasPrice: parseInt(tx.gasPrice),
        timestamp: new Date(parseInt(tx.timeStamp) * 1000),
        isError: tx.isError === "1",
      }));

      // Try to store wallet and transactions, but continue if database fails
      try {
        await storage.upsertWallet(validAddress, validStartBlock);
        for (const tx of processedTransactions) {
          await storage.upsertTransaction(tx);
        }
      } catch (dbError) {
        console.warn("Database storage failed, continuing without persistence:", dbError);
      }

      // Calculate stats
      const incomingTxs = processedTransactions.filter((tx: any) => 
        tx.toAddress?.toLowerCase() === validAddress.toLowerCase()
      );
      const outgoingTxs = processedTransactions.filter((tx: any) => 
        tx.fromAddress.toLowerCase() === validAddress.toLowerCase()
      );

      const totalReceived = incomingTxs.reduce((sum: bigint, tx: any) => sum + BigInt(tx.value), BigInt(0));
      const totalSent = outgoingTxs.reduce((sum: bigint, tx: any) => sum + BigInt(tx.value), BigInt(0));

      const stats = {
        totalTransactions: processedTransactions.length,
        incomingTransactions: incomingTxs.length,
        outgoingTransactions: outgoingTxs.length,
        totalReceived: totalReceived.toString(),
        totalSent: totalSent.toString(),
        netBalance: (totalReceived - totalSent).toString(),
      };

      res.json({
        transactions: processedTransactions.slice(0, 50), // Limit to 50 for UI
        stats,
        address: validAddress,
        startBlock: validStartBlock,
      });

    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get current balance
  app.get("/api/wallet/:address/balance", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      const balance = await etherscanService.getBalance(address);
      
      res.json({
        address,
        balance,
        balanceEth: (BigInt(balance) / BigInt("1000000000000000000")).toString(),
      });

    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  // Get balance at specific date (bonus feature)
  app.get("/api/wallet/:address/balance-at-date", async (req, res) => {
    try {
      const { address } = req.params;
      const { date } = req.query;
      
      const validation = balanceAtDateSchema.safeParse({ address, date });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { address: validAddress, date: validDate } = validation.data;

      // Convert date to timestamp (00:00 UTC)
      const targetDate = new Date(`${validDate}T00:00:00Z`);
      const timestamp = Math.floor(targetDate.getTime() / 1000);

      // Get block number for that timestamp
      const blockNumber = await etherscanService.getBlockByTimestamp(timestamp);
      
      // Get balance at that block
      const balance = await etherscanService.getBalance(validAddress, blockNumber);
      
      res.json({
        address: validAddress,
        date: validDate,
        blockNumber,
        timestamp,
        balance,
        balanceEth: (BigInt(balance) / BigInt("1000000000000000000")).toString(),
      });

    } catch (error) {
      console.error("Error fetching historical balance:", error);
      res.status(500).json({ error: "Failed to fetch historical balance" });
    }
  });

  // Get comprehensive wallet analysis
  app.get("/api/wallet/:address/analyze", async (req, res) => {
    try {
      const { address } = req.params;
      const { startBlock = "9000000" } = req.query;
      
      const validation = searchSchema.safeParse({ address, startBlock });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { address: validAddress, startBlock: validStartBlock } = validation.data;

      // Fetch all data in parallel
      const [
        transactions,
        tokenTransfers,
        internalTxs,
        nftTransfers,
        currentBalance
      ] = await Promise.all([
        etherscanService.getTransactions(validAddress, validStartBlock),
        etherscanService.getTokenTransfers(validAddress, validStartBlock),
        etherscanService.getInternalTransactions(validAddress, validStartBlock),
        etherscanService.getNFTTransfers(validAddress, validStartBlock),
        etherscanService.getBalance(validAddress)
      ]);

      // Process transactions with method details
      const processedTransactions = transactions.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: parseInt(tx.blockNumber),
        blockHash: tx.blockHash,
        fromAddress: tx.from.toLowerCase(),
        toAddress: tx.to?.toLowerCase() || null,
        value: tx.value,
        gasUsed: parseInt(tx.gasUsed),
        gasPrice: parseInt(tx.gasPrice),
        timestamp: new Date(parseInt(tx.timeStamp) * 1000),
        isError: tx.isError === "1",
        methodId: tx.methodId || "0x",
        functionName: tx.functionName || "Transfer",
        inputData: tx.input || "0x"
      }));

      // Process token transfers
      const processedTokenTransfers = tokenTransfers.map((transfer: any) => ({
        transactionHash: transfer.hash,
        blockNumber: parseInt(transfer.blockNumber),
        fromAddress: transfer.from.toLowerCase(),
        toAddress: transfer.to.toLowerCase(), 
        contractAddress: transfer.contractAddress.toLowerCase(),
        value: transfer.value,
        tokenName: transfer.tokenName,
        tokenSymbol: transfer.tokenSymbol,
        tokenDecimals: parseInt(transfer.tokenDecimal),
        timestamp: new Date(parseInt(transfer.timeStamp) * 1000),
      }));

      // Calculate comprehensive stats
      const incomingTxs = processedTransactions.filter((tx: any) => 
        tx.toAddress?.toLowerCase() === validAddress.toLowerCase()
      );
      const outgoingTxs = processedTransactions.filter((tx: any) => 
        tx.fromAddress.toLowerCase() === validAddress.toLowerCase()
      );

      const totalReceived = incomingTxs.reduce((sum: bigint, tx: any) => sum + BigInt(tx.value), BigInt(0));
      const totalSent = outgoingTxs.reduce((sum: bigint, tx: any) => sum + BigInt(tx.value), BigInt(0));
      const totalVolume = totalReceived + totalSent;

      // Group token transfers by token
      const tokenBalances = processedTokenTransfers.reduce((acc: Record<string, any>, transfer: any) => {
        const key = transfer.contractAddress;
        if (!acc[key]) {
          acc[key] = {
            contractAddress: transfer.contractAddress,
            tokenName: transfer.tokenName,
            tokenSymbol: transfer.tokenSymbol,
            tokenDecimals: transfer.tokenDecimals,
            balance: BigInt(0),
            incoming: 0,
            outgoing: 0,
          };
        }
        
        const isIncoming = transfer.toAddress.toLowerCase() === validAddress.toLowerCase();
        const value = BigInt(transfer.value);
        
        if (isIncoming) {
          acc[key].balance += value;
          acc[key].incoming++;
        } else {
          acc[key].balance -= value;
          acc[key].outgoing++;
        }
        
        return acc;
      }, {});

      // Convert BigInt balances to strings for JSON serialization
      const tokenBalancesSerialized = Object.values(tokenBalances).map((token: any) => ({
        ...token,
        balance: token.balance.toString(),
      }));

      const stats = {
        totalTransactions: processedTransactions.length,
        incomingTransactions: incomingTxs.length,
        outgoingTransactions: outgoingTxs.length,
        totalReceived: totalReceived.toString(),
        totalSent: totalSent.toString(),
        totalVolume: totalVolume.toString(),
        netBalance: (totalReceived - totalSent).toString(),
        currentBalance: currentBalance,
        currentBalanceEth: (BigInt(currentBalance) / BigInt("1000000000000000000")).toString(),
        firstActivityBlock: processedTransactions.length > 0 ? Math.min(...processedTransactions.map(tx => tx.blockNumber)) : validStartBlock,
        lastActivityBlock: processedTransactions.length > 0 ? Math.max(...processedTransactions.map(tx => tx.blockNumber)) : validStartBlock,
        tokenCount: Object.keys(tokenBalances).length,
        nftTransferCount: nftTransfers.length,
        internalTxCount: internalTxs.length,
      };

      res.json({
        address: validAddress,
        startBlock: validStartBlock,
        stats,
        transactions: processedTransactions,
        tokenTransfers: processedTokenTransfers,
        tokenBalances: tokenBalancesSerialized,
        internalTransactions: internalTxs,
        nftTransfers,
        analysis: {
          isActive: processedTransactions.length > 0,
          mostUsedFunction: getMostUsedFunction(processedTransactions),
          averageGasUsage: processedTransactions.reduce((sum: number, tx: any) => sum + tx.gasUsed, 0) / processedTransactions.length || 0,
          averageTransactionValue: Number(totalVolume) / (processedTransactions.length * 1e18) || 0,
        }
      });

    } catch (error) {
      console.error("Error in comprehensive wallet analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze wallet";
      res.status(500).json({ error: errorMessage });
    }
  });

  function getMostUsedFunction(transactions: { functionName?: string }[]) {
    const functionCounts = transactions.reduce((acc: Record<string, number>, tx: any) => {
      const func = tx.functionName || "Transfer";
      acc[func] = (acc[func] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(functionCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }

  // Get token transfers (bonus feature)
  app.get("/api/wallet/:address/tokens", async (req, res) => {
    try {
      const { address } = req.params;
      const { startBlock = "0" } = req.query;
      
      const validation = searchSchema.safeParse({ address, startBlock });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { address: validAddress, startBlock: validStartBlock } = validation.data;

      const tokenTransfers = await etherscanService.getTokenTransfers(validAddress, validStartBlock);
      
      // If no token transfers found, return empty result with message
      if (!tokenTransfers || tokenTransfers.length === 0) {
        return res.json({
          tokenTransfers: [],
          address: validAddress,
          startBlock: validStartBlock,
          message: "No token transfers found for this address in the specified block range"
        });
      }
      
      const processedTransfers = tokenTransfers.map((transfer: any) => ({
        transactionHash: transfer.hash,
        blockNumber: parseInt(transfer.blockNumber),
        fromAddress: transfer.from.toLowerCase(),
        toAddress: transfer.to.toLowerCase(),
        contractAddress: transfer.contractAddress.toLowerCase(),
        value: transfer.value,
        tokenName: transfer.tokenName,
        tokenSymbol: transfer.tokenSymbol,
        tokenDecimals: parseInt(transfer.tokenDecimal),
        timestamp: new Date(parseInt(transfer.timeStamp) * 1000),
      }));

      // Try to store token transfers, but continue if database fails
      try {
        for (const transfer of processedTransfers) {
          await storage.upsertTokenTransfer(transfer);
        }
      } catch (dbError) {
        console.warn("Database storage failed for token transfers, continuing without persistence:", dbError);
      }

      res.json({
        tokenTransfers: processedTransfers.slice(0, 50),
        address: validAddress,
        startBlock: validStartBlock,
      });

    } catch (error) {
      console.error("Error fetching token transfers:", error);
      res.status(500).json({ error: "Failed to fetch token transfers" });
    }
  });

  // Get latest blocks
  app.get("/api/latest-blocks", async (req, res) => {
    try {
      const cacheKey = 'latest-blocks';
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      const url = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`;
      const blockResponse = await fetch(url);
      const data = await blockResponse.json();
      
      if (!data.result) {
        return res.json({ blocks: [] });
      }
      
      const latestBlockNumber = parseInt(data.result, 16);
      const blocks = [];
      
      if (isNaN(latestBlockNumber)) {
        return res.json({ blocks: [] });
      }
      
      // Get last 6 blocks with proper error handling
      for (let i = 0; i < 6; i++) {
        try {
          const blockNumber = latestBlockNumber - i;
          const blockUrl = `${etherscanService.baseUrl}?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${process.env.ETHERSCAN_API_KEY}`;
          const blockResponse = await fetch(blockUrl);
          const blockData = await blockResponse.json();
          
          if (blockData.result && blockData.result.number && blockData.result.timestamp) {
            const block = blockData.result;
            const now = Date.now();
            const blockTime = parseInt(block.timestamp, 16) * 1000;
            const timeAgo = Math.floor((now - blockTime) / 1000);
            
            // Parse values with validation
            const parsedBlockNumber = parseInt(block.number, 16);
            const parsedGasUsed = block.gasUsed ? parseInt(block.gasUsed, 16) : 0;
            const parsedTimestamp = parseInt(block.timestamp, 16);
            
            // Only add if core values are valid
            if (!isNaN(parsedBlockNumber) && !isNaN(parsedTimestamp) && parsedTimestamp > 0) {
              // Format gas used properly (in millions for readability)
              const gasUsedFormatted = !isNaN(parsedGasUsed) ? (parsedGasUsed / 1000000).toFixed(2) + "M" : "0.00M";
              
              blocks.push({
                number: parsedBlockNumber.toString(),
                miner: block.miner || "Unknown",
                txCount: Array.isArray(block.transactions) ? block.transactions.length : 0,
                gasUsed: gasUsedFormatted,
                timeAgo: timeAgo < 60 ? `${timeAgo} secs ago` : `${Math.floor(timeAgo / 60)} min ago`
              });
            }
          }
        } catch (blockError) {
          console.warn(`Failed to fetch block ${latestBlockNumber - i}:`, blockError);
          // Continue to next block instead of failing completely
        }
      }
      
      const blocksResponse = { blocks };
      setCachedData(cacheKey, blocksResponse);
      res.json(blocksResponse);
    } catch (error: any) {
      console.error("Error fetching latest blocks:", error);
      console.error("Error details:", error.message);
      // Still try to get at least basic block data
      try {
        const blockUrl = `${etherscanService.baseUrl}?chainid=1&module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`;
        const blockResponse = await fetch(blockUrl);
        const blockData = await blockResponse.json();
        if (blockData.result) {
          const latestBlock = parseInt(blockData.result, 16);
          const basicBlocks = [{
            number: latestBlock,
            timestamp: Date.now(),
            txCount: "N/A",
            miner: "Loading...",
            gasUsed: "Loading...",
            timeAgo: "Live"
          }];
          res.json({ blocks: basicBlocks });
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
      const blocksErrorResponse = { blocks: [] };
      res.json(blocksErrorResponse);
    }
  });

  // Get latest transactions
  app.get("/api/latest-transactions", async (req, res) => {
    try {
      const cacheKey = 'latest-transactions';
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      const url = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`;
      const txResponse = await fetch(url);
      const data = await txResponse.json();
      
      if (!data.result) {
        return res.json({ transactions: [] });
      }
      
      const latestBlockNumber = parseInt(data.result, 16);
      const transactions = [];
      
      if (isNaN(latestBlockNumber)) {
        return res.json({ transactions: [] });
      }
      
      // Search through multiple recent blocks to find transactions
      for (let blockOffset = 0; blockOffset < 5 && transactions.length < 6; blockOffset++) {
        try {
          const blockNumber = latestBlockNumber - blockOffset;
          const blockUrl = `${etherscanService.baseUrl}?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${process.env.ETHERSCAN_API_KEY}`;
          const blockResponse = await fetch(blockUrl);
          const blockData = await blockResponse.json();
          
          if (blockData.result && Array.isArray(blockData.result.transactions) && blockData.result.timestamp) {
            const blockTransactions = blockData.result.transactions;
            const now = Date.now();
            const blockTime = parseInt(blockData.result.timestamp, 16) * 1000;
            const timeAgo = Math.floor((now - blockTime) / 1000);
            
            for (const tx of blockTransactions) {
              if (tx.hash && tx.from && tx.to && tx.value) {
                const valueWei = parseInt(tx.value, 16);
                if (valueWei > 0) {
                  const valueEth = (valueWei / 1e18);
                  
                  transactions.push({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: valueEth.toFixed(6),
                    timeAgo: timeAgo < 60 ? `${timeAgo} secs ago` : `${Math.floor(timeAgo / 60)} min ago`
                  });
                  
                  if (transactions.length >= 6) break;
                }
              }
            }
          }
        } catch (blockError) {
          console.warn(`Failed to fetch transactions from block ${latestBlockNumber - blockOffset}:`, blockError);
        }
      }
      
      const transactionsResponse = { transactions };
      setCachedData(cacheKey, transactionsResponse);
      res.json(transactionsResponse);
    } catch (error: any) {
      console.error("Error fetching latest transactions:", error);
      console.error("Full error details:", error.message, error.stack);
      // Still try to get at least latest block number
      try {
        const blockUrl = `${etherscanService.baseUrl}?chainid=1&module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`;
        const blockResponse = await fetch(blockUrl);
        const blockData = await blockResponse.json();
        if (blockData.result) {
          const latestBlock = parseInt(blockData.result, 16);
          console.log("Latest block number:", latestBlock);
          // Force refresh to try getting real transactions
          const basicTx = [{
            hash: "Loading real data...",
            from: "0x0000...",
            to: "0x0000...", 
            value: "0.000000",
            timeAgo: "Loading..."
          }];
          res.json({ transactions: basicTx });
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
      }
      const txErrorResponse = { transactions: [] };
      res.json(txErrorResponse);
    }
  });

  // Simple in-memory cache with TTL
  const cache = new Map();
  const CACHE_TTL = 10000; // 10 seconds - reduced for more fresh data

  const getCachedData = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  };

  // Get network stats
  app.get("/api/network-stats", async (req, res) => {
    try {
      const cacheKey = 'network-stats';
      const cachedStats = getCachedData(cacheKey);
      if (cachedStats) {
        return res.json(cachedStats);
      }

      // Default stats structure
      const stats = [
        {
          title: "ETHER PRICE",
          value: "$0.00",
          change: "Loading...",
          changeType: "positive"
        },
        {
          title: "LATEST BLOCK",
          value: "Loading...",
          subtitle: "Live"
        },
        {
          title: "GAS PRICE",
          value: "Loading...",
          subtitle: "Standard"
        },
        {
          title: "NETWORK",
          value: "Ethereum Mainnet"
        },
        {
          title: "CONFIRMATIONS",
          value: "12 blocks"
        },
        {
          title: "STATUS",
          value: "Live"
        }
      ];

      // Fetch ETH price from Etherscan to match their data exactly
      try {
        const ethPriceUrl = `${etherscanService.baseUrl}?chainid=1&module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`;
        const priceResponse = await fetch(ethPriceUrl);
        const priceData = await priceResponse.json();
        
        if (priceData.status === "1" && priceData.result?.ethusd) {
          const ethPrice = parseFloat(priceData.result.ethusd);
          if (!isNaN(ethPrice)) {
            stats[0].value = `$${ethPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            stats[0].change = "Live data";
          }
        }
      } catch (priceError) {
        console.warn("Failed to fetch ETH price from Etherscan:", priceError);
      }
      
      // Fetch latest block
      try {
        const blockUrl = `${etherscanService.baseUrl}?chainid=1&module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`;
        const blockResponse = await fetch(blockUrl);
        const blockData = await blockResponse.json();
        if (blockData.result && typeof blockData.result === 'string') {
          const latestBlock = parseInt(blockData.result, 16);
          if (!isNaN(latestBlock) && latestBlock > 0) {
            stats[1].value = latestBlock.toLocaleString();
          }
        }
      } catch (blockError) {
        console.warn("Failed to fetch latest block:", blockError);
      }
      
      // Fetch gas price
      try {
        const gasUrl = `${etherscanService.baseUrl}?chainid=1&module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`;
        const gasResponse = await fetch(gasUrl);
        const gasData = await gasResponse.json();
        if (gasData.result) {
          // Try different gas price fields
          const gasPrice = gasData.result.ProposeGasPrice || gasData.result.StandardGasPrice || gasData.result.SafeGasPrice;
          if (gasPrice) {
            const gasPriceNum = parseFloat(gasPrice);
            if (!isNaN(gasPriceNum)) {
              stats[2].value = `${gasPriceNum.toFixed(2)} Gwei`;
            }
          }
        }
      } catch (gasError) {
        console.warn("Failed to fetch gas price:", gasError);
      }
      
      // Add exact timestamp to response
      const response = {
        stats,
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now()
      };
      
      // Cache the response
      setCachedData(cacheKey, response);
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching network stats:", error);
      // Return default stats even if there's an error
      const fallbackStats = [
        { title: "ETHER PRICE", value: "Unavailable", change: "Error", changeType: "neutral" },
        { title: "LATEST BLOCK", value: "Unavailable", subtitle: "Error" },
        { title: "GAS PRICE", value: "Unavailable", subtitle: "Error" },
        { title: "NETWORK", value: "Ethereum Mainnet" },
        { title: "CONFIRMATIONS", value: "12 blocks" },
        { title: "STATUS", value: "Error" }
      ];
      res.json({ 
        stats: fallbackStats,
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now()
      });
    }
  });

  // Get ETH price history for charts
  app.get("/api/eth-price-history", async (req, res) => {
    try {
      const daysParam = req.query.days || '7';
      const daysString = Array.isArray(daysParam) ? daysParam[0] : daysParam;
      const days = parseInt(typeof daysString === 'string' ? daysString : '7');
      const validDays = isNaN(days) ? 7 : Math.max(1, Math.min(days, 365)); // Limit between 1-365 days
      
      const cacheKey = `eth-price-history-${validDays}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Get current price from Etherscan for consistency
      const ethPriceUrl = `${etherscanService.baseUrl}?chainid=1&module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`;
      const priceResponse = await fetch(ethPriceUrl);
      const priceData = await priceResponse.json();
      
      let currentPrice = 4000; // fallback price
      if (priceData.status === "1" && priceData.result?.ethusd) {
        currentPrice = parseFloat(priceData.result.ethusd);
      }
      
      // Generate historical data based on current price (simplified approach for consistency)
      const now = Date.now();
      const chartData = Array.from({ length: validDays }, (_, i) => {
        const dayOffset = validDays - 1 - i;
        const timestamp = now - (dayOffset * 24 * 60 * 60 * 1000);
        // Simulate small price variations around current price for demo
        const variation = (Math.random() - 0.5) * 200; // ±$100 variation
        const price = Math.max(100, currentPrice + variation);
        return {
          timestamp,
          price,
          date: new Date(timestamp).toISOString()
        };
      });
        
      const response = { 
        data: chartData,
        lastUpdated: new Date().toISOString(),
        period: `${validDays} days`
      };
      setCachedData(cacheKey, response);
      res.json(response);
    } catch (error) {
      console.error("Error fetching ETH price history:", error);
      const errorResponse = { data: [], lastUpdated: new Date().toISOString(), period: "N/A" };
      res.json(errorResponse);
    }
  });

  // Get network activity metrics
  app.get("/api/network-activity", async (req, res) => {
    try {
      const url = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.result) {
        return res.json({ 
          metrics: [],
          lastUpdated: new Date().toISOString()
        });
      }
      
      const latestBlockNumber = parseInt(data.result, 16);
      const metrics = [];
      
      if (!isNaN(latestBlockNumber)) {
        // Get data for last 10 blocks for activity chart
        for (let i = 9; i >= 0; i--) {
          try {
            const blockNumber = latestBlockNumber - i;
            const blockUrl = `${etherscanService.baseUrl}?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${process.env.ETHERSCAN_API_KEY}`;
            const blockResponse = await fetch(blockUrl);
            const blockData = await blockResponse.json();
            
            if (blockData.result && blockData.result.timestamp) {
              const block = blockData.result;
              const timestamp = parseInt(block.timestamp, 16) * 1000;
              const gasUsed = block.gasUsed ? parseInt(block.gasUsed, 16) : 0;
              const txCount = Array.isArray(block.transactions) ? block.transactions.length : 0;
              
              metrics.push({
                blockNumber: blockNumber,
                timestamp: timestamp,
                txCount: txCount,
                gasUsed: gasUsed,
                gasUsedFormatted: (gasUsed / 1000000).toFixed(2)
              });
            }
          } catch (blockError) {
            console.warn(`Failed to fetch block ${latestBlockNumber - i} for metrics:`, blockError);
          }
        }
      }
      
      res.json({ 
        metrics,
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error fetching network activity:", error);
      res.json({ 
        metrics: [],
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now()
      });
    }
  });

  // New V2 API endpoints
  
  // Get internal transactions
  app.get("/api/wallet/:address/internal-transactions", async (req, res) => {
    try {
      const { address } = req.params;
      const { startBlock = "0" } = req.query;
      
      const validation = searchSchema.safeParse({ address, startBlock });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { address: validAddress, startBlock: validStartBlock } = validation.data;
      const internalTransactions = await etherscanService.getInternalTransactions(validAddress, validStartBlock);
      
      res.json({
        internalTransactions,
        address: validAddress,
        startBlock: validStartBlock,
      });

    } catch (error) {
      console.error("Error fetching internal transactions:", error);
      res.status(500).json({ error: "Failed to fetch internal transactions" });
    }
  });

  // Get NFT transfers (ERC-721)
  app.get("/api/wallet/:address/nft-transfers", async (req, res) => {
    try {
      const { address } = req.params;
      const { startBlock = "0" } = req.query;
      
      const validation = searchSchema.safeParse({ address, startBlock });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { address: validAddress, startBlock: validStartBlock } = validation.data;
      const nftTransfers = await etherscanService.getNFTTransfers(validAddress, validStartBlock);
      
      res.json({
        nftTransfers,
        address: validAddress,
        startBlock: validStartBlock,
      });

    } catch (error) {
      console.error("Error fetching NFT transfers:", error);
      res.status(500).json({ error: "Failed to fetch NFT transfers" });
    }
  });

  // Get transaction status
  app.get("/api/transaction/:hash/status", async (req, res) => {
    try {
      const { hash } = req.params;
      
      if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
        return res.status(400).json({ error: "Invalid transaction hash" });
      }

      const status = await etherscanService.getTransactionStatus(hash);
      const receipt = await etherscanService.getTransactionReceipt(hash);
      
      res.json({
        hash,
        status,
        receipt,
      });

    } catch (error) {
      console.error("Error fetching transaction status:", error);
      res.status(500).json({ error: "Failed to fetch transaction status" });
    }
  });

  // Get event logs for address
  app.get("/api/wallet/:address/events", async (req, res) => {
    try {
      const { address } = req.params;
      const { fromBlock = "0", toBlock = "99999999" } = req.query;
      
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      const fromBlockNum = parseInt(fromBlock as string) || 0;
      const toBlockNum = parseInt(toBlock as string) || 99999999;
      
      const events = await etherscanService.getEventLogs(address, fromBlockNum, toBlockNum);
      
      res.json({
        address,
        events,
        fromBlock: fromBlockNum,
        toBlock: toBlockNum,
      });

    } catch (error) {
      console.error("Error fetching event logs:", error);
      res.status(500).json({ error: "Failed to fetch event logs" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
