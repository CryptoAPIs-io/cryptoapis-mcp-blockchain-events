import * as z from "zod";
import { RequestMetadataSchema, ConfirmationSchema } from "@cryptoapis-io/mcp-shared";

export const BlockchainEventsCreateToolSchema = z
    .object({
        eventType: z.string().min(1).describe("Event type (e.g. UNCONFIRMED_COINS_TRANSACTION, CONFIRMED_COINS_TRANSACTION)"),
        callbackUrl: z.string().url().describe("Webhook callback URL"),
        callbackSecretKey: z.string().optional().describe("Secret key for HMAC-signing webhook payloads (recommended for verifying authenticity)"),
        blockchain: z.string().optional().describe("Blockchain protocol (e.g. bitcoin, ethereum); required for most event types"),
        network: z.string().optional().describe("Network name (e.g. mainnet, testnet, sepolia); required for most event types"),
        address: z.string().optional().describe("Address to monitor (required for address-specific event types like ADDRESS_COINS_TRANSACTION_CONFIRMED)"),
        transactionId: z.string().optional().describe("Transaction ID to track (required for transaction-specific event types)"),
    })
    .merge(RequestMetadataSchema)
    .merge(ConfirmationSchema);

export type BlockchainEventsCreateToolInput = z.infer<typeof BlockchainEventsCreateToolSchema>;
