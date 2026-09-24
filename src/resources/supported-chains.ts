import type { SupportedChainsResource } from "@cryptoapis-io/mcp-shared";
import { EVENT_TYPE_BLOCKCHAINS, EVENT_TYPE_NETWORKS } from "../tools/create/schema.js";

/**
 * The 8 event types blockchain_events_create actually supports, each its own
 * dedicated endpoint with its own blockchain/network support (see
 * EVENT_TYPE_BLOCKCHAINS/EVENT_TYPE_NETWORKS in tools/create/schema.ts).
 */
export const EVENT_TYPES = Object.keys(EVENT_TYPE_BLOCKCHAINS);

const allBlockchains = Array.from(new Set(Object.values(EVENT_TYPE_BLOCKCHAINS).flat())).sort();

const networksByBlockchain: Record<string, readonly string[]> = {};
for (const [eventType, blockchains] of Object.entries(EVENT_TYPE_BLOCKCHAINS)) {
    const networks = EVENT_TYPE_NETWORKS[eventType] ?? [];
    for (const bc of blockchains) {
        const existing = new Set(networksByBlockchain[bc] ?? []);
        networks.forEach((n) => existing.add(n));
        networksByBlockchain[bc] = Array.from(existing);
    }
}

/**
 * Union across all 8 event types, for the generic "which blockchains does this
 * package touch at all" view. The actual set for any single create call is
 * narrower — see EVENT_TYPE_BLOCKCHAINS/EVENT_TYPE_NETWORKS for the per-event
 * truth, which the tool handler validates against.
 */
export const supportedChains: SupportedChainsResource = {
    all: {
        blockchains: allBlockchains,
        networks: networksByBlockchain,
        actions: {
            create: allBlockchains,
            "list-subscriptions": allBlockchains,
            "get-subscription": allBlockchains,
            "delete-subscription": allBlockchains,
            "activate-subscription": allBlockchains,
        },
    },
};
