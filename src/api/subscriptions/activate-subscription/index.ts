import type { CryptoApisHttpClient, RequestMetadata } from "@cryptoapis-io/mcp-shared";

export type ActivateSubscriptionInput = { blockchain: string; network: string; referenceId: string } & RequestMetadata;

export async function activateSubscription(client: CryptoApisHttpClient, input: ActivateSubscriptionInput) {
    return client.request<unknown>(
        "POST",
        `/blockchain-events/${input.blockchain}/${input.network}/${encodeURIComponent(input.referenceId)}/activate`,
        { query: { context: input.context } }
    );
}
