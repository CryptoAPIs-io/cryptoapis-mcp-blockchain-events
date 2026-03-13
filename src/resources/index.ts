import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { supportedChains, EVENT_TYPES } from "./supported-chains.js";

const RESOURCE_URI = "cryptoapis://blockchain-events/supported-chains";

export function registerResources(server: McpServer): void {
    server.registerResource(
        "supported-chains",
        RESOURCE_URI,
        { description: "Supported blockchains, networks, event types, and actions for the blockchain-events tools" },
        (uri) => ({
            contents: [{
                uri: uri.href,
                mimeType: "application/json",
                text: JSON.stringify({ ...supportedChains, eventTypes: EVENT_TYPES }, null, 2),
            }],
        }),
    );
}
