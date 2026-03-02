import type { CryptoApisHttpClient, ToolCredits } from "@cryptoapis-io/mcp-shared";
import type * as z from "zod";

export type McpToolDef<TSchema extends z.ZodTypeAny> = {
    name: string;
    description: string;
    credits?: ToolCredits;
    inputSchema: TSchema;
    handler: (client: CryptoApisHttpClient) => (input: z.infer<TSchema>) => Promise<{ content: { type: "text"; text: string }[] }>;
};
