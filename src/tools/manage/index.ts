import type { CryptoApisHttpClient, RequestResult, DangerousActionMap, McpLogger } from "@cryptoapis-io/mcp-shared";
import { requiresConfirmation, buildConfirmationPreview, formatDangerousActionsWarning } from "@cryptoapis-io/mcp-shared";
import type { McpToolDef } from "../types.js";
import { BlockchainEventsManageToolSchema, type BlockchainEventsManageToolInput } from "./schema.js";
import * as api from "../../api/subscriptions/index.js";
import { credits as listCredits } from "./list-subscriptions/credits.js";
import { credits as getCredits } from "./get-subscription/credits.js";
import { credits as deleteCredits } from "./delete-subscription/credits.js";
import { credits as activateCredits } from "./activate-subscription/credits.js";

const DANGEROUS_ACTIONS: DangerousActionMap = {
    "delete-subscription": {
        warning: "Deleting a subscription permanently stops webhook delivery for this event.",
        impact: "No more callbacks will be sent. A new subscription must be created to resume monitoring.",
    },
    "activate-subscription": {
        warning: "Reactivating a subscription resumes webhook delivery and daily monitoring charges.",
        impact: "Daily monitoring tax will resume for this subscription.",
    },
};

const ACTION_CREDITS: Record<string, number> = {
    "delete-subscription": deleteCredits,
    "activate-subscription": activateCredits,
};

export const blockchainEventsManageTool: McpToolDef<typeof BlockchainEventsManageToolSchema> = {
    name: "blockchain_events_manage",
    description: `Manage existing webhook subscriptions for on-chain events. Use this to view, delete, or re-activate event subscriptions created via blockchain_events_create.

Actions:
• list-subscriptions: List all active subscriptions for a blockchain/network (paginated)
• get-subscription: Get details of a specific subscription by its referenceId
• delete-subscription: Remove a subscription (stops webhook delivery)
• activate-subscription: Re-activate a previously deactivated subscription${formatDangerousActionsWarning(DANGEROUS_ACTIONS)}`,
    credits: {
        "list-subscriptions": listCredits,
        "get-subscription": getCredits,
        "delete-subscription": deleteCredits,
        "activate-subscription": activateCredits,
    },
    inputSchema: BlockchainEventsManageToolSchema,
    handler: (client: CryptoApisHttpClient, logger: McpLogger) => async (input: BlockchainEventsManageToolInput) => {
        const dangerousAction = await requiresConfirmation(input.action, DANGEROUS_ACTIONS, input.confirmationToken);
        if (dangerousAction) {
            return await buildConfirmationPreview(input.action, dangerousAction, ACTION_CREDITS[input.action]);
        }

        let result: RequestResult<unknown>;
        const base = { blockchain: input.blockchain!, network: input.network!, context: input.context };
        switch (input.action) {
            case "list-subscriptions":
                result = await api.listSubscriptions(client, { ...base, limit: input.limit, offset: input.offset });
                break;
            case "get-subscription":
                result = await api.getSubscription(client, { ...base, referenceId: input.referenceId! });
                break;
            case "delete-subscription":
                result = await api.deleteSubscription(client, { ...base, referenceId: input.referenceId! });
                break;
            case "activate-subscription":
                result = await api.activateSubscription(client, { ...base, referenceId: input.referenceId! });
                break;
            default:
                throw new Error(`Unknown action: ${(input as any).action}`);
        }
        logger.logInfo({
            tool: "blockchain_events_manage",
            action: input.action,
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
