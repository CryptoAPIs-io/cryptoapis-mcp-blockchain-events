import type { CryptoApisHttpClient, RequestMetadata } from "@cryptoapis-io/mcp-shared";

export type CreateSubscriptionInput = {
    eventType: string;
    callbackUrl: string;
    callbackSecretKey?: string;
    blockchain?: string;
    network?: string;
    address?: string;
    transactionId?: string;
    [key: string]: unknown;
} & RequestMetadata;

export async function createSubscription(client: CryptoApisHttpClient, input: CreateSubscriptionInput) {
    const item: Record<string, unknown> = {
        eventType: input.eventType,
        callbackUrl: input.callbackUrl,
        callbackSecretKey: input.callbackSecretKey,
        blockchain: input.blockchain,
        network: input.network,
        address: input.address,
        transactionId: input.transactionId,
    };
    Object.keys(input).forEach((k) => {
        if (!["context", "eventType", "callbackUrl", "callbackSecretKey", "blockchain", "network", "address", "transactionId"].includes(k)) {
            const v = (input as Record<string, unknown>)[k];
            if (v !== undefined) item[k] = v;
        }
    });
    return client.request<unknown>("POST", "/blockchain-events/subscriptions", {
        query: { context: input.context },
        body: { data: { item } },
    });
}
