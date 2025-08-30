import {
  type User, type InsertUser, type Wallet, type Transaction,
  type TokenTransfer, type BalanceHistory
} from "@shared/schema";
import { type IStorage } from "./storage";

export class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private wallets: Wallet[] = [];
  private transactions: Transaction[] = [];
  private tokenTransfers: TokenTransfer[] = [];
  private balanceHistoryData: BalanceHistory[] = [];
  private nextUserId = 1;
  private nextTransactionId = 1;
  private nextTokenTransferId = 1;
  private nextBalanceHistoryId = 1;
  private nextWalletId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...insertUser
    };
    this.users.push(user);
    return user;
  }

  // Wallet methods
  async upsertWallet(address: string, lastScannedBlock: number): Promise<Wallet> {
    const lowerAddress = address.toLowerCase();
    const existing = await this.getWallet(address);
    
    if (existing) {
      existing.lastScannedBlock = lastScannedBlock;
      return existing;
    } else {
      const wallet: Wallet = {
        id: this.nextWalletId++,
        address: lowerAddress,
        lastScannedBlock,
        createdAt: new Date()
      };
      this.wallets.push(wallet);
      return wallet;
    }
  }

  async getWallet(address: string): Promise<Wallet | undefined> {
    return this.wallets.find(w => w.address === address.toLowerCase());
  }

  // Transaction methods
  async upsertTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const existing = this.transactions.find(t => t.hash === transaction.hash);
    if (existing) {
      return existing;
    }

    const newTransaction: Transaction = {
      id: this.nextTransactionId++,
      ...transaction,
      fromAddress: transaction.fromAddress.toLowerCase(),
      toAddress: transaction.toAddress?.toLowerCase() || null,
      createdAt: new Date()
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async getTransactionsByWallet(address: string, limit: number = 50): Promise<Transaction[]> {
    const lowerAddress = address.toLowerCase();
    return this.transactions
      .filter(t => t.fromAddress === lowerAddress || t.toAddress === lowerAddress)
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, limit);
  }

  // Token transfer methods
  async upsertTokenTransfer(transfer: Omit<TokenTransfer, 'id' | 'createdAt'>): Promise<TokenTransfer> {
    const existing = this.tokenTransfers.find(t => 
      t.transactionHash === transfer.transactionHash && 
      t.contractAddress === transfer.contractAddress.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    const newTransfer: TokenTransfer = {
      id: this.nextTokenTransferId++,
      ...transfer,
      fromAddress: transfer.fromAddress.toLowerCase(),
      toAddress: transfer.toAddress.toLowerCase(),
      contractAddress: transfer.contractAddress.toLowerCase(),
      createdAt: new Date()
    };
    this.tokenTransfers.push(newTransfer);
    return newTransfer;
  }

  async getTokenTransfersByWallet(address: string, limit: number = 50): Promise<TokenTransfer[]> {
    const lowerAddress = address.toLowerCase();
    return this.tokenTransfers
      .filter(t => t.fromAddress === lowerAddress || t.toAddress === lowerAddress)
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, limit);
  }

  // Balance history methods
  async saveBalanceHistory(balanceData: Omit<BalanceHistory, 'id' | 'createdAt'>): Promise<BalanceHistory> {
    const newBalance: BalanceHistory = {
      id: this.nextBalanceHistoryId++,
      ...balanceData,
      walletAddress: balanceData.walletAddress.toLowerCase(),
      createdAt: new Date()
    };
    this.balanceHistoryData.push(newBalance);
    return newBalance;
  }

  async getBalanceHistory(address: string, limit: number = 100): Promise<BalanceHistory[]> {
    return this.balanceHistoryData
      .filter(b => b.walletAddress === address.toLowerCase())
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, limit);
  }
}