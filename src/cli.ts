import { startBlockchainEventsServer } from "./server.js";

function getArg(name: string): string | undefined {
    const idx = process.argv.indexOf(`--${name}`);
    return idx === -1 ? undefined : process.argv[idx + 1];
}

async function main() {
    const transport = (getArg("transport") ?? "stdio") as "stdio" | "http";
    const apiKey = getArg("api-key");
    if (transport === "stdio") {
        await startBlockchainEventsServer({ transport: "stdio", apiKey });
        return;
    }
    await startBlockchainEventsServer({
        transport: "http",
        host: getArg("host") ?? "0.0.0.0",
        port: Number(getArg("port") ?? "3000"),
        path: getArg("path") ?? "/mcp",
        stateless: process.argv.includes("--stateless"),
        apiKey,
    });
}

main().catch((err) => { console.error(err); process.exit(1); });
