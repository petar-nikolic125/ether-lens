import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, or, and } from "drizzle-orm";
import { 
  users, wallets, transactions, tokenTransfers, balanceHistory,
  type User, type InsertUser, type Wallet, type Transaction, 
  type TokenTransfer, type BalanceHistory 
} from "@shared/schema";
import { InMemoryStorage } from "./in-memory-storage";

// Create database connection only if DATABASE_URL is available
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const db = sql ? drizzle(sql) : null;

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet methods
  upsertWallet(address: string, lastScannedBlock: number): Promise<Wallet>;
  getWallet(address: string): Promise<Wallet | undefined>;
  
  // Transaction methods
  upsertTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  getTransactionsByWallet(address: string, limit?: number): Promise<Transaction[]>;
  
  // Token transfer methods
  upsertTokenTransfer(transfer: Omit<TokenTransfer, 'id' | 'createdAt'>): Promise<TokenTransfer>;
  getTokenTransfersByWallet(address: string, limit?: number): Promise<TokenTransfer[]>;
  
  // Balance history methods
  saveBalanceHistory(balanceData: Omit<BalanceHistory, 'id' | 'createdAt'>): Promise<BalanceHistory>;
  getBalanceHistory(address: string, limit?: number): Promise<BalanceHistory[]>;
}

export class DrizzleStorage implements IStorage {
  private db: NonNullable<typeof db>;
  
  constructor(database: NonNullable<typeof db>) {
    this.db = database;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Wallet methods
  async upsertWallet(address: string, lastScannedBlock: number): Promise<Wallet> {
    const existing = await this.getWallet(address);
    
    if (existing) {
      const result = await this.db
        .update(wallets)
        .set({ lastScannedBlock })
        .where(eq(wallets.address, address.toLowerCase()))
        .returning();
      return result[0];
    } else {
      const result = await this.db
        .insert(wallets)
        .values({ 
          address: address.toLowerCase(), 
          lastScannedBlock 
        })
        .returning();
      return result[0];
    }
  }

  async getWallet(address: string): Promise<Wallet | undefined> {
    const result = await this.db
      .select()
      .from(wallets)
      .where(eq(wallets.address, address.toLowerCase()))
      .limit(1);
    return result[0];
  }

  // Transaction methods
  async upsertTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    try {
      // Check if transaction already exists
      const existing = await this.db
        .select()
        .from(transactions)
        .where(eq(transactions.hash, transaction.hash))
        .limit(1);
      
      if (existing.length > 0) {
        return existing[0];
      }
      
      // Insert new transaction
      const result = await this.db
        .insert(transactions)
        .values({
          ...transaction,
          fromAddress: transaction.fromAddress.toLowerCase(),
          toAddress: transaction.toAddress?.toLowerCase() || null,
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error upserting transaction:", error);
      // Return existing if insert failed due to conflict
      const existing = await this.db
        .select()
        .from(transactions)
        .where(eq(transactions.hash, transaction.hash))
        .limit(1);
      return existing[0];
    }
  }

  async getTransactionsByWallet(address: string, limit: number = 50): Promise<Transaction[]> {
    const lowerAddress = address.toLowerCase();
    return await this.db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.fromAddress, lowerAddress),
          eq(transactions.toAddress, lowerAddress)
        )
      )
      .orderBy(transactions.blockNumber)
      .limit(limit);
  }

  // Token transfer methods
  async upsertTokenTransfer(transfer: Omit<TokenTransfer, 'id' | 'createdAt'>): Promise<TokenTransfer> {
    try {
      // Check if transfer already exists
      const existing = await this.db
        .select()
        .from(tokenTransfers)
        .where(
          and(
            eq(tokenTransfers.transactionHash, transfer.transactionHash),
            eq(tokenTransfers.contractAddress, transfer.contractAddress.toLowerCase())
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        return existing[0];
      }
      
      // Insert new transfer
      const result = await this.db
        .insert(tokenTransfers)
        .values({
          ...transfer,
          fromAddress: transfer.fromAddress.toLowerCase(),
          toAddress: transfer.toAddress.toLowerCase(),
          contractAddress: transfer.contractAddress.toLowerCase(),
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error upserting token transfer:", error);
      // Return existing if insert failed due to conflict
      const existing = await this.db
        .select()
        .from(tokenTransfers)
        .where(
          and(
            eq(tokenTransfers.transactionHash, transfer.transactionHash),
            eq(tokenTransfers.contractAddress, transfer.contractAddress.toLowerCase())
          )
        )
        .limit(1);
      return existing[0];
    }
  }

  async getTokenTransfersByWallet(address: string, limit: number = 50): Promise<TokenTransfer[]> {
    const lowerAddress = address.toLowerCase();
    return await this.db
      .select()
      .from(tokenTransfers)
      .where(
        or(
          eq(tokenTransfers.fromAddress, lowerAddress),
          eq(tokenTransfers.toAddress, lowerAddress)
        )
      )
      .orderBy(tokenTransfers.blockNumber)
      .limit(limit);
  }

  // Balance history methods
  async saveBalanceHistory(balanceData: Omit<BalanceHistory, 'id' | 'createdAt'>): Promise<BalanceHistory> {
    const result = await this.db
      .insert(balanceHistory)
      .values({
        ...balanceData,
        walletAddress: balanceData.walletAddress.toLowerCase(),
      })
      .returning();
    return result[0];
  }

  async getBalanceHistory(address: string, limit: number = 100): Promise<BalanceHistory[]> {
    return await this.db
      .select()
      .from(balanceHistory)
      .where(eq(balanceHistory.walletAddress, address.toLowerCase()))
      .orderBy(balanceHistory.blockNumber)
      .limit(limit);
  }
}

// Export appropriate storage implementation based on DATABASE_URL availability
export const storage: IStorage = db ? new DrizzleStorage(db) : new InMemoryStorage();
