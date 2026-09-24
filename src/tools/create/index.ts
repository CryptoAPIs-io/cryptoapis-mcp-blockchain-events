import type { CryptoApisHttpClient, RequestResult, DangerousActionMap, McpLogger } from "@cryptoapis-io/mcp-shared";
import { requiresConfirmation, buildConfirmationPreview, formatDangerousActionsWarning } from "@cryptoapis-io/mcp-shared";
import type { McpToolDef } from "../types.js";
import {
    BlockchainEventsCreateToolSchema,
    type BlockchainEventsCreateToolInput,
    EVENT_TYPE_BLOCKCHAINS,
    EVENT_TYPE_NETWORKS,
    EVENT_TYPES_REQUIRING_ADDRESS,
    EVENT_TYPES_REQUIRING_CONFIRMATIONS_COUNT,
} from "./schema.js";
import { createSubscription } from "../../api/subscriptions/create-subscription/index.js";
import { credits as createCredits } from "./credits.js";

const DANGEROUS_ACTIONS: DangerousActionMap = {
    create: {
        warning: "Creating a subscription starts webhook delivery with daily monitoring costs.",
        impact: "Daily monitoring tax per active subscription plus one-time processing tax per callback sent. Subscriptions persist until explicitly deleted. Use system_info(action='credits') for exact costs per blockchain.",
    },
};

export const blockchainEventsCreateTool: McpToolDef<typeof BlockchainEventsCreateToolSchema> = {
    name: "blockchain_events_create",
    description: `Create a webhook subscription for on-chain events. When the specified event occurs, CryptoAPIs sends a POST request to your callbackUrl with the event data. Subscriptions persist until deleted.

Event types (supported blockchains vary per type — an invalid blockchain for the chosen eventType is rejected before calling the API):
• address-coins-transactions-unconfirmed: fires when an unconfirmed coin transaction touches the address
• address-coins-transactions-confirmed: fires once a coin transaction confirms (optionally on an exact confirmation via receiveCallbackOn)
• address-coins-transactions-confirmed-each-confirmation: fires on every confirmation up to confirmationsCount (required)
• address-tokens-transactions-confirmed: fires once a token transfer confirms
• address-tokens-transactions-confirmed-each-confirmation: fires on every confirmation up to confirmationsCount (required)
• address-internal-transactions-confirmed: fires once a confirmed internal (contract-internal) transaction touches the address
• address-internal-transactions-confirmed-each-confirmation: fires on every confirmation up to confirmationsCount (required)
• block-mined: fires on every new block (no address field)

All event types except block-mined require an address.${formatDangerousActionsWarning(DANGEROUS_ACTIONS)}`,
    credits: createCredits,
    inputSchema: BlockchainEventsCreateToolSchema,
    handler: (client: CryptoApisHttpClient, logger: McpLogger) => async (input: BlockchainEventsCreateToolInput) => {
        const allowedBlockchains = EVENT_TYPE_BLOCKCHAINS[input.eventType];
        if (allowedBlockchains && !allowedBlockchains.includes(input.blockchain)) {
            throw new Error(
                `blockchain "${input.blockchain}" is not supported by eventType "${input.eventType}". Supported: ${allowedBlockchains.join(", ")}`,
            );
        }
        const allowedNetworks = EVENT_TYPE_NETWORKS[input.eventType];
        if (allowedNetworks && !allowedNetworks.includes(input.network)) {
            throw new Error(
                `network "${input.network}" is not supported by eventType "${input.eventType}". Supported: ${allowedNetworks.join(", ")}`,
            );
        }
        if (EVENT_TYPES_REQUIRING_ADDRESS.has(input.eventType) && !input.address) {
            throw new Error(`address is required for eventType "${input.eventType}"`);
        }
        if (EVENT_TYPES_REQUIRING_CONFIRMATIONS_COUNT.has(input.eventType) && input.confirmationsCount === undefined) {
            throw new Error(`confirmationsCount is required for eventType "${input.eventType}"`);
        }

        const dangerousAction = await requiresConfirmation("create", DANGEROUS_ACTIONS, input.confirmationToken);
        if (dangerousAction) {
            return await buildConfirmationPreview("create", dangerousAction, createCredits);
        }

        const result: RequestResult<unknown> = await createSubscription(client, {
            eventType: input.eventType,
            callbackUrl: input.callbackUrl,
            callbackSecretKey: input.callbackSecretKey,
            blockchain: input.blockchain,
            network: input.network,
            address: input.address,
            allowDuplicates: input.allowDuplicates,
            receiveCallbackOn: input.receiveCallbackOn,
            confirmationsCount: input.confirmationsCount,
            context: input.context,
        });
        logger.logInfo({
            tool: "blockchain_events_create",
            action: "create",
            blockchain: input.blockchain,
            network: input.network,
            creditsConsumed: result.creditsConsumed,
            creditsAvailable: result.creditsAvailable,
            responseTime: result.responseTime,
            throughputUsage: result.throughputUsage,
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        ...(result.data as object),
                        creditsConsumed: result.creditsConsumed,
                        creditsAvailable: result.creditsAvailable,
                        responseTime: result.responseTime,
                        throughputUsage: result.throughputUsage,
                    }),
                },
            ],
        };
    },
};
