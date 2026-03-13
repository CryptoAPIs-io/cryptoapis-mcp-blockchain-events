import {
    BLOCKCHAIN_NETWORKS,
    EVM_BLOCKCHAINS,
    UTXO_BLOCKCHAINS,
} from "@cryptoapis-io/mcp-shared";
import type { SupportedChainsResource } from "@cryptoapis-io/mcp-shared";

/**
 * All blockchains supported by blockchain-events (both EVM and UTXO).
 * The create-subscription API accepts any blockchain/network from BLOCKCHAIN_NETWORKS.
 */

const evmBlockchains = EVM_BLOCKCHAINS as readonly string[];
const utxoBlockchains = UTXO_BLOCKCHAINS as readonly string[];

const evmNetworks: Record<string, readonly string[]> = {};
for (const bc of evmBlockchains) {
    evmNetworks[bc] = BLOCKCHAIN_NETWORKS[bc as keyof typeof BLOCKCHAIN_NETWORKS];
}

const utxoNetworks: Record<string, readonly string[]> = {};
for (const bc of utxoBlockchains) {
    utxoNetworks[bc] = BLOCKCHAIN_NETWORKS[bc as keyof typeof BLOCKCHAIN_NETWORKS];
}

/** Event types supported by the blockchain_events_create tool. */
export const EVENT_TYPES = [
    "UNCONFIRMED_COINS_TRANSACTION",
    "CONFIRMED_COINS_TRANSACTION",
    "UNCONFIRMED_TOKENS_TRANSACTION",
    "CONFIRMED_TOKENS_TRANSACTION",
    "NEW_BLOCK",
    "ADDRESS_COINS_TRANSACTION_CONFIRMED",
    "ADDRESS_COINS_TRANSACTION_UNCONFIRMED",
    "ADDRESS_TOKENS_TRANSACTION_CONFIRMED",
    "ADDRESS_TOKENS_TRANSACTION_UNCONFIRMED",
] as const;

export const supportedChains: SupportedChainsResource = {
    evm: {
        blockchains: evmBlockchains,
        networks: evmNetworks,
        actions: {
            create: [...evmBlockchains],
            "list-subscriptions": [...evmBlockchains],
            "get-subscription": [...evmBlockchains],
            "delete-subscription": [...evmBlockchains],
            "activate-subscription": [...evmBlockchains],
        },
    },
    utxo: {
        blockchains: utxoBlockchains,
        networks: utxoNetworks,
        actions: {
            create: [...utxoBlockchains],
            "list-subscriptions": [...utxoBlockchains],
            "get-subscription": [...utxoBlockchains],
            "delete-subscription": [...utxoBlockchains],
            "activate-subscription": [...utxoBlockchains],
        },
    },
};
