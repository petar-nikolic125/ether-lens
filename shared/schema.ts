import { pgTable, text, serial, integer, boolean, timestamp, bigint, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Wallet addresses being tracked
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 42 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastScannedBlock: bigint("last_scanned_block", { mode: "number" }),
});

// Individual transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  hash: varchar("hash", { length: 66 }).notNull().unique(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  blockHash: varchar("block_hash", { length: 66 }).notNull(),
  fromAddress: varchar("from_address", { length: 42 }).notNull(),
  toAddress: varchar("to_address", { length: 42 }),
  value: decimal("value", { precision: 78, scale: 0 }).notNull(), // Wei amount
  gasUsed: bigint("gas_used", { mode: "number" }).notNull(),
  gasPrice: bigint("gas_price", { mode: "number" }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  isError: boolean("is_error").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ERC-20 token transfers
export const tokenTransfers = pgTable("token_transfers", {
  id: serial("id").primaryKey(),
  transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  fromAddress: varchar("from_address", { length: 42 }).notNull(),
  toAddress: varchar("to_address", { length: 42 }).notNull(),
  contractAddress: varchar("contract_address", { length: 42 }).notNull(),
  value: decimal("value", { precision: 78, scale: 0 }).notNull(),
  tokenName: text("token_name"),
  tokenSymbol: text("token_symbol"),
  tokenDecimals: integer("token_decimals"),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Historical balances at specific blocks
export const balanceHistory = pgTable("balance_history", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  balance: decimal("balance", { precision: 78, scale: 0 }).notNull(), // Wei amount
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWalletSchema = createInsertSchema(wallets);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertTokenTransferSchema = createInsertSchema(tokenTransfers);
export const insertBalanceHistorySchema = createInsertSchema(balanceHistory);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type TokenTransfer = typeof tokenTransfers.$inferSelect;
export type BalanceHistory = typeof balanceHistory.$inferSelect;
