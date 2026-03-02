import type { CryptoApisHttpClient, RequestMetadata } from "@cryptoapis-io/mcp-shared";

export type GetSubscriptionInput = { blockchain: string; network: string; referenceId: string } & RequestMetadata;

export async function getSubscription(client: CryptoApisHttpClient, input: GetSubscriptionInput) {
    return client.request<unknown>(
        "GET",
        `/blockchain-events/${input.blockchain}/${input.network}/${encodeURIComponent(input.referenceId)}`,
        { query: { context: input.context } }
    );
}
