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

      // Store wallet if not exists
      await storage.upsertWallet(validAddress, validStartBlock);

      // Store transactions
      for (const tx of processedTransactions) {
        await storage.upsertTransaction(tx);
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
      const url = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanService.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const latestBlockNumber = parseInt(data.result, 16);
      const blocks = [];
      
      // Get last 6 blocks
      for (let i = 0; i < 6; i++) {
        const blockNumber = latestBlockNumber - i;
        const blockUrl = `${etherscanService.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${etherscanService.apiKey}`;
        const blockResponse = await fetch(blockUrl);
        const blockData = await blockResponse.json();
        
        if (blockData.result) {
          const block = blockData.result;
          const now = Date.now();
          const blockTime = parseInt(block.timestamp, 16) * 1000;
          const timeAgo = Math.floor((now - blockTime) / 1000);
          
          blocks.push({
            number: parseInt(block.number, 16).toString(),
            miner: block.miner,
            txCount: block.transactions.length,
            gasUsed: (parseInt(block.gasUsed, 16) / 1e18).toFixed(6),
            timeAgo: timeAgo < 60 ? `${timeAgo} secs ago` : `${Math.floor(timeAgo / 60)} min ago`
          });
        }
      }
      
      res.json({ blocks });
    } catch (error) {
      console.error("Error fetching latest blocks:", error);
      res.status(500).json({ error: "Failed to fetch latest blocks" });
    }
  });

  // Get latest transactions
  app.get("/api/latest-transactions", async (req, res) => {
    try {
      const url = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanService.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const latestBlockNumber = parseInt(data.result, 16);
      const transactions = [];
      
      // Get transactions from the latest block
      const blockUrl = `${etherscanService.baseUrl}?module=proxy&action=eth_getBlockByNumber&tag=0x${latestBlockNumber.toString(16)}&boolean=true&apikey=${etherscanService.apiKey}`;
      const blockResponse = await fetch(blockUrl);
      const blockData = await blockResponse.json();
      
      if (blockData.result && blockData.result.transactions) {
        const blockTransactions = blockData.result.transactions.slice(0, 6);
        const now = Date.now();
        const blockTime = parseInt(blockData.result.timestamp, 16) * 1000;
        const timeAgo = Math.floor((now - blockTime) / 1000);
        
        for (const tx of blockTransactions) {
          if (tx.value && parseInt(tx.value, 16) > 0) {
            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: (parseInt(tx.value, 16) / 1e18).toFixed(6),
              timeAgo: timeAgo < 60 ? `${timeAgo} secs ago` : `${Math.floor(timeAgo / 60)} min ago`
            });
            
            if (transactions.length >= 6) break;
          }
        }
      }
      
      res.json({ transactions });
    } catch (error) {
      console.error("Error fetching latest transactions:", error);
      res.status(500).json({ error: "Failed to fetch latest transactions" });
    }
  });

  // Get network stats
  app.get("/api/network-stats", async (req, res) => {
    try {
      // Get ETH price from a public API
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const priceData = await priceResponse.json();
      const ethPrice = priceData.ethereum?.usd || 0;
      
      // Get latest block
      const blockUrl = `${etherscanService.baseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanService.apiKey}`;
      const blockResponse = await fetch(blockUrl);
      const blockData = await blockResponse.json();
      const latestBlock = parseInt(blockData.result, 16);
      
      // Get gas price
      const gasUrl = `${etherscanService.baseUrl}?module=gastracker&action=gasoracle&apikey=${etherscanService.apiKey}`;
      const gasResponse = await fetch(gasUrl);
      const gasData = await gasResponse.json();
      
      const stats = [
        {
          title: "ETHER PRICE",
          value: `$${ethPrice.toFixed(2)}`,
          change: "Live data",
          changeType: "positive"
        },
        {
          title: "LATEST BLOCK",
          value: latestBlock.toLocaleString(),
          subtitle: "Live"
        },
        {
          title: "GAS PRICE",
          value: gasData.result?.StandardGasPrice ? `${gasData.result.StandardGasPrice} Gwei` : "Loading...",
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
      
      res.json({ stats });
    } catch (error) {
      console.error("Error fetching network stats:", error);
      res.status(500).json({ error: "Failed to fetch network stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
