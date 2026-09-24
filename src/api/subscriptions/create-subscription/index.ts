import type { CryptoApisHttpClient, RequestMetadata } from "@cryptoapis-io/mcp-shared";

/** URL path segment for each event type, per the spec's 8 dedicated create-subscription endpoints. */
export const EVENT_TYPE_PATH_SEGMENT: Record<string, string> = {
    "address-coins-transactions-unconfirmed": "address-coins-transactions-unconfirmed",
    "address-coins-transactions-confirmed": "address-coins-transactions-confirmed",
    "address-coins-transactions-confirmed-each-confirmation": "address-coins-transactions-confirmed-each-confirmation",
    "address-tokens-transactions-confirmed": "address-tokens-transactions-confirmed",
    "address-tokens-transactions-confirmed-each-confirmation": "address-tokens-transactions-confirmed-each-confirmation",
    "address-internal-transactions-confirmed": "address-internal-transactions-confirmed",
    "address-internal-transactions-confirmed-each-confirmation": "address-internal-transactions-confirmed-each-confirmation",
    "block-mined": "block-mined",
};

export type CreateSubscriptionInput = {
    eventType: string;
    blockchain: string;
    network: string;
    callbackUrl: string;
    callbackSecretKey?: string;
    address?: string;
    allowDuplicates?: boolean;
    receiveCallbackOn?: number;
    confirmationsCount?: number;
} & RequestMetadata;

export async function createSubscription(client: CryptoApisHttpClient, input: CreateSubscriptionInput) {
    const segment = EVENT_TYPE_PATH_SEGMENT[input.eventType];
    const item: Record<string, unknown> = {
        callbackUrl: input.callbackUrl,
        callbackSecretKey: input.callbackSecretKey,
        address: input.address,
        allowDuplicates: input.allowDuplicates,
        receiveCallbackOn: input.receiveCallbackOn,
        confirmationsCount: input.confirmationsCount,
    };
    return client.request<unknown>("POST", `/blockchain-events/${input.blockchain}/${input.network}/${segment}`, {
        query: { context: input.context },
        body: { data: { item } },
    });
}
