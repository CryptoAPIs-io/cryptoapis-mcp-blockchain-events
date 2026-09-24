import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { formatSupportedChains } from "@cryptoapis-io/mcp-shared";
import { supportedChains } from "../resources/supported-chains.js";

export function registerPrompts(server: McpServer): void {
    server.registerPrompt(
        "setup-webhook",
        {
            description: "Set up a webhook subscription for on-chain events",
            argsSchema: {
                blockchain: z.string().describe("Blockchain protocol (e.g. bitcoin, ethereum)"),
                network: z.string().describe("Network name (e.g. mainnet, testnet, sepolia)"),
                callbackUrl: z.string().describe("Webhook callback URL to receive event notifications"),
                eventType: z.string().optional().describe("Specific event type to subscribe to (e.g. block-mined, address-coins-transactions-confirmed)"),
            },
        },
        (args): GetPromptResult => {
            const { blockchain, network, callbackUrl, eventType } = args;

            const eventClause = eventType
                ? `The user wants to subscribe to the "${eventType}" event type. Create that specific event subscription using blockchain_events_create.`
                : `The user has not specified an event type yet. First explain the available event types (e.g., address-coins-transactions-confirmed for tracking a confirmed coin transaction at a specific address, address-coins-transactions-unconfirmed for the unconfirmed/mempool version, block-mined for new block notifications with no address needed, address-tokens-transactions-confirmed for token transfers at an address, the "-each-confirmation" variants for a callback on every confirmation up to a chosen count) and help the user choose the right one for their use case.`;

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `Help me set up a webhook subscription on ${blockchain}/${network} using blockchain_events_create. The callback URL is ${callbackUrl}. ${eventClause} After creation, confirm the subscription details and explain how to manage it using blockchain_events_manage (list, get, delete, or re-activate subscriptions).\n\n${formatSupportedChains(supportedChains)}`,
                        },
                    },
                ],
            };
        },
    );
}
