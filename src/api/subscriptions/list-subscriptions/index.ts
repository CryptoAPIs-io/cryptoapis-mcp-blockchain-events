import type { CryptoApisHttpClient, RequestMetadata } from "@cryptoapis-io/mcp-shared";

export type ListSubscriptionsInput = RequestMetadata & {
    blockchain: string;
    network: string;
    limit?: number;
    offset?: number;
};

export async function listSubscriptions(client: CryptoApisHttpClient, input: ListSubscriptionsInput) {
    return client.request<unknown>(
        "GET",
        `/blockchain-events/${input.blockchain}/${input.network}`,
        { query: { context: input.context, limit: input.limit, offset: input.offset } }
    );
}
