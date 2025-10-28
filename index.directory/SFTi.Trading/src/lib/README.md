# src/lib — Library module map

This document describes every file in `src/lib/` and the role it plays in IB-G.Scanner. Use it as the canonical quick-reference for maintainers working on IBKR integration, AI helpers, market utilities, or general helpers.

Goal: give a compact contract (inputs/outputs), main responsibilities, likely edge-cases, and recommended tests or TODOs for each file.

---

## Files

### aiPatterns.ts

- Purpose: Contains pattern definitions, rules, and small helpers used by AI-powered analysis and pattern recognition features.

- Contract:
  - Inputs: stock price series, technical indicator values, pattern request descriptors
  - Outputs: detected pattern objects (type, confidence, metadata)

- Edge cases: incomplete time series, NaN values, extremely short series

- Tests: unit tests for each pattern using synthetic series that should and should not trigger matches

- TODO: export a validation function that checks input shape and returns helpful errors.

### aiSearch.ts

- Purpose: Implements AI search orchestration for user queries (natural language -> pattern/query translation). Calls `aiPatterns` and other helpers.

- Contract:
  - Inputs: user query string, optional filters/market context
  - Outputs: ranked search results, relevance scores, highlighted patterns

- Edge cases: ambiguous queries, very long queries, empty queries

- Tests: integration tests that mock pattern engine and verify ranking and filtering logic

- TODO: add rate-limiting and timeout handling for external LLM/API calls (if used).

### alerts.ts

- Purpose: Alert creation, scheduling, and formatting helpers used by `AlertsManager` UI.

- Contract:
  - Inputs: alert definitions (symbol, condition, threshold, channels)
  - Outputs: normalized alert payloads suitable for UI and server-side endpoints

- Edge cases: invalid symbols, conflicting alert rules, time-in-force handling

- Tests: unit tests for normalization and validation; e2e test with AlertsManager UI

- TODO: move validation schema into a shared `types` validator and add tests for edge conditions.

### ibkr-gateway-browser.ts

- Purpose: Browser-side Client Portal Gateway integration. Detects gateway, polls `iserver/auth/status`, initiates popup-based SSO, and provides fetch-based wrappers for market data and orders.

- Contract:
  - Inputs: browser environment (window), user actions to start SSO, optional fallback proxy
  - Outputs: methods: `authenticate()`, `authenticateWithPopup()`, `getMarketData()`, `placeOrder()`, etc.

- Important behavior:
  - Uses `credentials: 'include'` with fetch to preserve gateway cookies.
  - Falls back to public proxy endpoints if local gateway is unreachable.

- Edge cases: CORS issues, self-signed TLS certs, popup blockers, slow SSO flows

- Tests: unit tests for control flow; headful browser tests (Playwright) that exercise popup flow and `iserver/auth/status` polling.

- TODO: document how to test with a persistent Playwright context and how to accept the gateway cert.

### ibkr-browser.ts

- Purpose: Lightweight browser-only IBKR service (PWA-compatible). Uses public IBKR endpoints or proxy endpoints to provide market data and limited account info without a local gateway.

- Contract:
  - Inputs: web environment, search symbols
  - Outputs: market data snapshots, minimal account metadata

- Edge cases: rate limits from IBKR public proxies, network offline, service worker interactions

- Tests: mock fetch tests and PWA offline tests

### ibkr.ts

- Purpose: Primary IBKR service used by the desktop/mobile app. Handles gateway status checks, authentication flow logic, WebSocket connection to the gateway, and high-level market/positions/order APIs.

- Contract:
  - Inputs: configured gateway URL (`IBKR_GATEWAY_URL` / `IBKR_BASE_URL`), credentials (optionally), and runtime environment
  - Outputs: `connect()`, `getMarketData()`, `getPositions()`, `placeOrder()`, `subscribeToMarketData()` (via WebSocket)

- Important behavior:
  - Creates WebSocket to `wss://<gateway>/v1/api/ws` and interprets messages (topics like `sts`, `smd`, `umd`, `sor`)
  - Falls back to demo data when unauthenticated

- Edge cases: WebSocket handshake failures (TLS/cert), 401/403 after stale sessions, single-broker session competition rules

- Tests: integration mocks for WebSocket messages, unit tests for error handling in `authenticateWithGateway()` and `checkGatewayStatus()`

- TODO: add a small helper to test `iserver/auth/status` via `curl -k` and include output in docs for debugging.

### market.ts

- Purpose: Market utilities and caching helpers used by the scanner and table (symbol normalization, caching strategy, lightweight in-memory store)

- Contract:
  - Inputs: symbol queries, contract search results
  - Outputs: normalized symbols, conid lookups, simple LRU/TTL cache values

- Edge cases: cache stampede, TTL drift, memory growth

- Tests: unit tests for normalization and cache eviction policies

### utils.ts

- Purpose: Miscellaneous utility helpers used by the app (formatting, date helpers, small pure functions)

- Contract:
  - Inputs: various primitive types
  - Outputs: formatted strings, parsed values, helper objects

- Edge cases: invalid inputs, locale-specific formatting

- Tests: small unit tests per function, snapshot for formatting functions

---

## Recommended next actions

1. Add `src/lib/README.md` (this file) — done.

2. Add `src/lib/tests/*` unit tests for the critical modules (`ibkr.ts`, `ibkr-gateway-browser.ts`, `aiPatterns.ts`).

3. Add `Documentation/ibkr-quickstart.md` that includes minimal `curl -k` checks and how to accept the gateway cert for Chrome/Playwright.

4. Add a Playwright example that uses a persistent profile to complete the manual gateway login, export cookies, and reuse them in automated tests.

---

If you want, I can now create `src/components/README.md` and `scripts/README.md` with the same format. Which folder should I do next?
