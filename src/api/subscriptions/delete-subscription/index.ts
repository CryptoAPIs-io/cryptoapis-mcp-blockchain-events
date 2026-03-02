import type { CryptoApisHttpClient, RequestMetadata } from "@cryptoapis-io/mcp-shared";

export type DeleteSubscriptionInput = { blockchain: string; network: string; referenceId: string } & RequestMetadata;

export async function deleteSubscription(client: CryptoApisHttpClient, input: DeleteSubscriptionInput) {
    return client.request<unknown>(
        "DELETE",
        `/blockchain-events/${input.blockchain}/${input.network}/${encodeURIComponent(input.referenceId)}`,
        { query: { context: input.context } }
    );
}
