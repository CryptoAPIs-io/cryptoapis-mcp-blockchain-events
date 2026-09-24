import * as z from "zod";
import { RequestMetadataSchema, ConfirmationSchema } from "@cryptoapis-io/mcp-shared";

export const ManageAction = z.enum(["list-subscriptions", "get-subscription", "delete-subscription", "activate-subscription"]);

/**
 * All 4 management actions accept the same uniform set of blockchains/networks
 * per the spec — unlike create-subscription, which is narrower per event type.
 */
export const ManageBlockchain = z.enum([
    "bitcoin", "bitcoin-cash", "dash", "dogecoin", "litecoin", "zcash",
    "ethereum", "ethereum-classic", "binance-smart-chain", "polygon", "tron",
    "xrp", "tezos", "optimism", "arbitrum", "avalanche", "solana", "base", "kaspa",
]);

export const ManageNetwork = z.enum([
    "mainnet", "testnet", "sepolia", "mordor", "amoy", "nile", "shadownet", "fuji", "devnet",
]);

export const BlockchainEventsManageToolSchema = z
    .object({
        action: ManageAction.describe("Action to perform"),
        blockchain: ManageBlockchain.optional().describe("Blockchain (required for all actions)"),
        network: ManageNetwork.optional().describe("Network (required for all actions)"),
        referenceId: z.string().optional().describe("Subscription reference ID (for get, delete, activate)"),
        limit: z.number().optional().describe("Max results per page (list-subscriptions only)"),
        offset: z.number().optional().describe("Pagination offset (list-subscriptions only)"),
    })
    .merge(RequestMetadataSchema)
    .merge(ConfirmationSchema);

export type BlockchainEventsManageToolInput = z.infer<typeof BlockchainEventsManageToolSchema>;
