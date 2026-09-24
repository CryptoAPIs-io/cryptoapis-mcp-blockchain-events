# @cryptoapis-io/mcp-blockchain-events

## 0.5.0

### Minor Changes

- 3167621: Security: the HTTP transport no longer serves unauthenticated callers with the operator's API key.

  Before, `--transport http --api-key <key>` listened on `0.0.0.0` and never authenticated the caller, so anyone who could reach the port could call every tool on the operator's key: spend their credits, and create, deactivate or delete their blockchain-event webhooks and HD-wallet syncs.

  - HTTP mode now listens on `127.0.0.1` by default, with DNS rebinding protection (Host header check).
  - Listening on a non-loopback address (`--host 0.0.0.0`) with a startup API key requires an auth token (`MCP_AUTH_TOKEN` or `--auth-token`); callers send `Authorization: Bearer <token>`. Without one the server refuses to start.
  - New `--allowed-hosts` restricts the Host header on non-loopback binds.
  - Per-request key mode (no startup key) now rejects requests without an `x-api-key` header with 401.
  - Stateful HTTP mode keeps one session per client; previously only the first client could ever connect.

  Breaking: clients connecting from another machine or container must now start the server with `--host 0.0.0.0` and an auth token. Reported by Syed Anas Mohiuddin.

### Patch Changes

- Updated dependencies [3167621]
  - @cryptoapis-io/mcp-shared@0.4.0

## 0.4.0

### Minor Changes

- 74154b1: Fix `blockchain_events_create`: it was calling `POST /blockchain-events/subscriptions`, which does not exist — every call failed live with `uri_not_found` regardless of input (BL-0199).

  The real API has 8 dedicated per-event-type endpoints (`/blockchain-events/{blockchain}/{network}/{event-slug}`), each with its own blockchain/network support and request body shape. Rewrote the tool to:

  - Use a real `eventType` enum of the 8 supported types (was an unvalidated free-text string previously claiming fictional uppercase names like `NEW_BLOCK`/`CONFIRMED_COINS_TRANSACTION`).
  - Validate blockchain/network per event type before calling the API — support varies significantly (e.g. `block-mined` supports 18 chains, `address-internal-transactions-confirmed` only the 9 EVM chains).
  - Require `confirmationsCount` for the three `-each-confirmation` event types, and `address` for every event type except `block-mined`.
  - Default `allowDuplicates` to `false` — the live API requires this field even though the spec marks it optional.
  - Correct the credit cost (was hardcoded 24, spec says 30 uniformly across all 8 event types).
  - Also gave `blockchain_events_manage`'s `blockchain`/`network` fields real Zod enums instead of unvalidated strings — verified all 4 management actions (list/get/delete/activate) genuinely accept the same uniform 19-chain union, so no per-action narrowing was needed there.

  Verified live against the QA API key: invalid event-type/blockchain combinations rejected pre-flight; a real `block-mined` create request now reaches the actual endpoint (confirmed via `allowDuplicates` field validation, then `callback_url_not_verified` once satisfied — both real API responses, not `uri_not_found`).

## 0.3.0

### Minor Changes

- Add MCP logging, resources, and prompts across all packages. Add debug-level tool call logging, replace console.error with McpLogger, remove .refine() from schemas for MCP client compatibility, and fix supply-chain vulnerabilities.

### Patch Changes

- Updated dependencies
  - @cryptoapis-io/mcp-shared@0.3.0

## 0.2.3

### Patch Changes

- Fix supply-chain vulnerabilities: update @modelcontextprotocol/sdk to ^1.27.1, express to ^4.22.1, add security warning to signer tool descriptions
- Updated dependencies
  - @cryptoapis-io/mcp-shared@0.2.3

## 0.2.2

### Patch Changes

- Add MCP Registry metadata (mcpName, server.json)
- Updated dependencies
  - @cryptoapis-io/mcp-shared@0.2.2

## 0.2.1

### Patch Changes

- Rename Hosted MCP Server to Remote MCP Server in documentation
- Updated dependencies
  - @cryptoapis-io/mcp-shared@0.2.1

## 0.2.0

### Minor Changes

- Add User-Agent and x-source headers to identify MCP traffic

### Patch Changes

- Updated dependencies
  - @cryptoapis-io/mcp-shared@0.2.0
