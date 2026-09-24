import * as z from "zod";
import { RequestMetadataSchema, ConfirmationSchema } from "@cryptoapis-io/mcp-shared";

/**
 * The 8 event types the API actually supports, each its own dedicated
 * create-subscription endpoint (/blockchain-events/{blockchain}/{network}/{slug}).
 * There is no generic "create any event type" endpoint (BL-0199).
 */
export const BlockchainEventType = z.enum([
    "address-coins-transactions-unconfirmed",
    "address-coins-transactions-confirmed",
    "address-coins-transactions-confirmed-each-confirmation",
    "address-tokens-transactions-confirmed",
    "address-tokens-transactions-confirmed-each-confirmation",
    "address-internal-transactions-confirmed",
    "address-internal-transactions-confirmed-each-confirmation",
    "block-mined",
]);

/**
 * Per-event-type supported blockchains/networks — these differ substantially
 * per event (e.g. block-mined supports 18 chains, address-internal-transactions
 * only supports the 9 EVM chains). Enforced in the tool handler as a pre-flight
 * check, not via Zod .superRefine() (breaks inputSchema introspection in MCP
 * clients like the Inspector).
 */
export const EVENT_TYPE_BLOCKCHAINS: Record<string, readonly string[]> = {
    "address-coins-transactions-unconfirmed": ["bitcoin", "bitcoin-cash", "dash", "dogecoin", "litecoin", "zcash"],
    "address-coins-transactions-confirmed": [
        "bitcoin", "bitcoin-cash", "dash", "dogecoin", "litecoin", "ethereum", "ethereum-classic",
        "binance-smart-chain", "zcash", "polygon", "tron", "xrp", "tezos", "optimism", "arbitrum",
        "avalanche", "solana", "base", "kaspa",
    ],
    "address-coins-transactions-confirmed-each-confirmation": [
        "bitcoin", "bitcoin-cash", "dash", "dogecoin", "litecoin", "ethereum", "ethereum-classic",
        "binance-smart-chain", "zcash", "polygon", "tron", "xrp", "tezos", "optimism", "arbitrum",
        "avalanche", "base",
    ],
    "address-tokens-transactions-confirmed": [
        "ethereum", "ethereum-classic", "binance-smart-chain", "polygon", "tron", "optimism",
        "arbitrum", "avalanche", "solana", "base",
    ],
    "address-tokens-transactions-confirmed-each-confirmation": [
        "bitcoin", "ethereum", "ethereum-classic", "binance-smart-chain", "polygon", "tron",
        "optimism", "arbitrum", "avalanche", "base",
    ],
    "address-internal-transactions-confirmed": [
        "ethereum", "ethereum-classic", "binance-smart-chain", "polygon", "tron", "optimism", "arbitrum", "avalanche", "base",
    ],
    "address-internal-transactions-confirmed-each-confirmation": [
        "ethereum", "ethereum-classic", "binance-smart-chain", "polygon", "tron", "optimism", "arbitrum", "avalanche", "base",
    ],
    "block-mined": [
        "bitcoin", "bitcoin-cash", "dash", "dogecoin", "litecoin", "ethereum", "ethereum-classic",
        "binance-smart-chain", "zcash", "polygon", "tron", "xrp", "tezos", "optimism", "arbitrum",
        "avalanche", "solana", "base",
    ],
};

export const EVENT_TYPE_NETWORKS: Record<string, readonly string[]> = {
    "address-coins-transactions-unconfirmed": ["mainnet", "testnet"],
    "address-coins-transactions-confirmed": ["mainnet", "testnet", "sepolia", "mordor", "amoy", "nile", "shadownet", "fuji", "devnet"],
    "address-coins-transactions-confirmed-each-confirmation": ["mainnet", "testnet", "sepolia", "mordor", "amoy", "nile", "shadownet", "fuji"],
    "address-tokens-transactions-confirmed": ["mainnet", "testnet", "sepolia", "mordor", "amoy", "nile", "fuji", "devnet"],
    "address-tokens-transactions-confirmed-each-confirmation": ["mainnet", "testnet", "sepolia", "mordor", "amoy", "nile", "fuji"],
    "address-internal-transactions-confirmed": ["mainnet", "testnet", "sepolia", "mordor", "amoy", "nile", "fuji"],
    "address-internal-transactions-confirmed-each-confirmation": ["mainnet", "testnet", "sepolia", "mordor", "amoy", "nile", "fuji"],
    "block-mined": ["mainnet", "testnet", "sepolia", "mordor", "amoy", "nile", "shadownet", "fuji", "devnet"],
};

/** Event types that require confirmationsCount (exact confirmation count to watch for). */
export const EVENT_TYPES_REQUIRING_CONFIRMATIONS_COUNT = new Set([
    "address-coins-transactions-confirmed-each-confirmation",
    "address-tokens-transactions-confirmed-each-confirmation",
    "address-internal-transactions-confirmed-each-confirmation",
]);

/** block-mined is the only event type with no address field. */
export const EVENT_TYPES_REQUIRING_ADDRESS = new Set([
    "address-coins-transactions-unconfirmed",
    "address-coins-transactions-confirmed",
    "address-coins-transactions-confirmed-each-confirmation",
    "address-tokens-transactions-confirmed",
    "address-tokens-transactions-confirmed-each-confirmation",
    "address-internal-transactions-confirmed",
    "address-internal-transactions-confirmed-each-confirmation",
]);

export const BlockchainEventsCreateToolSchema = z
    .object({
        eventType: BlockchainEventType.describe("Event type to subscribe to"),
        blockchain: z.string().min(1).describe("Blockchain protocol (e.g. bitcoin, ethereum); supported chains vary per eventType"),
        network: z.string().min(1).describe("Network name (e.g. mainnet, testnet, sepolia); supported networks vary per eventType"),
        callbackUrl: z.string().url().describe("Webhook callback URL"),
        callbackSecretKey: z.string().optional().describe("Secret key for HMAC-signing webhook payloads (recommended for verifying authenticity)"),
        address: z.string().optional().describe("Address to monitor (required for all event types except block-mined)"),
        allowDuplicates: z.boolean().default(false).describe("Whether to allow duplicate subscriptions for the same address/event. The API requires this field even though the spec marks it optional (verified live) — defaults to false."),
        receiveCallbackOn: z.number().int().optional().describe("Exact confirmation number to receive the callback on (address-coins-transactions-confirmed, address-tokens-transactions-confirmed, address-internal-transactions-confirmed only)"),
        confirmationsCount: z.number().int().optional().describe("Number of confirmations to track, sending a callback on each one (required for the '-each-confirmation' event types)"),
    })
    .merge(RequestMetadataSchema)
    .merge(ConfirmationSchema);

export type BlockchainEventsCreateToolInput = z.infer<typeof BlockchainEventsCreateToolSchema>;
