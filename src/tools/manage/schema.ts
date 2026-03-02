import * as z from "zod";
import { RequestMetadataSchema, ConfirmationSchema } from "@cryptoapis-io/mcp-shared";

export const ManageAction = z.enum(["list-subscriptions", "get-subscription", "delete-subscription", "activate-subscription"]);

export const BlockchainEventsManageToolSchema = z
    .object({
        action: ManageAction.describe("Action to perform"),
        blockchain: z.string().optional().describe("Blockchain (required for all actions)"),
        network: z.string().optional().describe("Network (required for all actions)"),
        referenceId: z.string().optional().describe("Subscription reference ID (for get, delete, activate)"),
        limit: z.number().optional().describe("Max results per page (list-subscriptions only)"),
        offset: z.number().optional().describe("Pagination offset (list-subscriptions only)"),
    })
    .merge(RequestMetadataSchema)
    .merge(ConfirmationSchema);

export type BlockchainEventsManageToolInput = z.infer<typeof BlockchainEventsManageToolSchema>;
