import type { CryptoApisHttpClient, RequestResult, DangerousActionMap, McpLogger } from "@cryptoapis-io/mcp-shared";
import { requiresConfirmation, buildConfirmationPreview, formatDangerousActionsWarning } from "@cryptoapis-io/mcp-shared";
import type { McpToolDef } from "../types.js";
import { BlockchainEventsCreateToolSchema, type BlockchainEventsCreateToolInput } from "./schema.js";
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

Event types include: UNCONFIRMED_COINS_TRANSACTION, CONFIRMED_COINS_TRANSACTION, UNCONFIRMED_TOKENS_TRANSACTION, CONFIRMED_TOKENS_TRANSACTION, NEW_BLOCK, ADDRESS_COINS_TRANSACTION_CONFIRMED, ADDRESS_TOKENS_TRANSACTION_CONFIRMED, and more. Some events require an address or transactionId parameter.${formatDangerousActionsWarning(DANGEROUS_ACTIONS)}`,
    credits: createCredits,
    inputSchema: BlockchainEventsCreateToolSchema,
    handler: (client: CryptoApisHttpClient, logger: McpLogger) => async (input: BlockchainEventsCreateToolInput) => {
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
            transactionId: input.transactionId,
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
