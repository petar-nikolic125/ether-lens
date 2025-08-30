import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Etherscan API service
class EtherscanService {
  public baseUrl = "https://api.etherscan.io/api";
  public apiKey = process.env.ETHERSCAN_API_KEY;

  async getTransactions(address: string, startBlock: number = 0, endBlock: number = 99999999) {
    const url = `${this.baseUrl}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=1000&sort=desc&apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch transactions");
    }
    
    return data.result;
  }

  async getTokenTransfers(address: string, startBlock: number = 0) {
    const url = `${this.baseUrl}?module=account&action=tokentx&address=${address}&startblock=${startBlock}&endblock=99999999&page=1&offset=1000&sort=desc&apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch token transfers");
    }
    
    return data.result;
  }

  async getBalance(address: string, blockNumber?: number) {
    const tag = blockNumber ? blockNumber.toString() : "latest";
    const url = `${this.baseUrl}?module=account&action=balance&address=${address}&tag=${tag}&apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch balance");
    }
    
    return data.result;
  }

  async getBlockByTimestamp(timestamp: number, closest: "before" | "after" = "before") {
    const url = `${this.baseUrl}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=${closest}&apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch block");
    }
    
    return parseInt(data.result);
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

      // Store token transfers
      for (const transfer of processedTransfers) {
        await storage.upsertTokenTransfer(transfer);
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
      const url = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanService.apiKey}`;
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
          const blockUrl = `${etherscanService.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${etherscanService.apiKey}`;
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
    } catch (error) {
      console.error("Error fetching latest blocks:", error);
      const blocksErrorResponse = { blocks: [] };
      res.json(blocksErrorResponse); // Return empty array instead of error
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
      const url = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanService.apiKey}`;
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
          const blockUrl = `${etherscanService.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${etherscanService.apiKey}`;
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
    } catch (error) {
      console.error("Error fetching latest transactions:", error);
      const txErrorResponse = { transactions: [] };
      res.json(txErrorResponse); // Return empty array instead of error
    }
  });

  // Simple in-memory cache with TTL
  const cache = new Map();
  const CACHE_TTL = 30000; // 30 seconds

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
        const ethPriceUrl = `${etherscanService.baseUrl}?module=stats&action=ethprice&apikey=${etherscanService.apiKey}`;
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
        const blockUrl = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanService.apiKey}`;
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
        const gasUrl = `${etherscanService.baseUrl}?module=gastracker&action=gasoracle&apikey=${etherscanService.apiKey}`;
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

      const priceResponse = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${validDays}&interval=${validDays <= 1 ? 'hourly' : 'daily'}`);
      const priceData = await priceResponse.json();
      
      if (priceData.prices) {
        const chartData = priceData.prices.map((price: [number, number]) => ({
          timestamp: price[0],
          price: price[1],
          date: new Date(price[0]).toISOString()
        }));
        
        const response = { 
          data: chartData,
          lastUpdated: new Date().toISOString(),
          period: `${validDays} days`
        };
        setCachedData(cacheKey, response);
        res.json(response);
      } else {
        const response = { data: [], lastUpdated: new Date().toISOString(), period: `${validDays} days` };
        setCachedData(cacheKey, response);
        res.json(response);
      }
    } catch (error) {
      console.error("Error fetching ETH price history:", error);
      const errorResponse = { data: [], lastUpdated: new Date().toISOString(), period: "N/A" };
      res.json(errorResponse);
    }
  });

  // Get network activity metrics
  app.get("/api/network-activity", async (req, res) => {
    try {
      const url = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanService.apiKey}`;
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
            const blockUrl = `${etherscanService.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${etherscanService.apiKey}`;
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

  const httpServer = createServer(app);

  return httpServer;
}
