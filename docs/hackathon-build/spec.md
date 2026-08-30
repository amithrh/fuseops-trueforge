# Technical Spec

## Overview

FuseOps is an npm workspace with a React operator console, a TypeScript MCP control-plane server, shared deterministic fixtures, and setup scripts for TrueForge. The live path embeds the official TrueForge standalone web client in an iframe; the replay path uses the same console components with deterministic public fixtures.

## Stack

- Node.js 22+ and TypeScript for a single-language workspace.
- React 19 + Vite for the console.
- TrueForge standalone v0.1.4 for live sessions and the official trace/approval UI.
- `@modelcontextprotocol/sdk` with Streamable HTTP transport for the owned operations connector.
- Express for MCP transport plus read-only console endpoints.
- Zod for tool input validation.
- Vitest for state-machine, MCP contract, replay-state, and console-behavior tests; direct desktop/mobile browser verification for the assembled UI.
- TrueForge local mode at `http://localhost:8790`.

Documentation: [Create an Agent](https://trueforge.dev/create-agent/overview), [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk).

## Architecture

### Operator console

Implements: `prd.md > Epic 4: See what happened` and `Epic 5: Run and judge the project`.

The console polls `/api/snapshot` from the owned simulator and renders health, incident context, and audit chronology. In live mode it performs a readiness check through a narrow Vite proxy, then embeds the standalone TrueForge home screen from `localhost:8790`; the operator selects the saved `fuseops-commander` agent in TrueForge. In replay mode it animates a deterministic event fixture and clearly labels the run as replayed.

### FuseOps control-plane MCP server

Implements: `prd.md > Epic 1: Understand the incident` and `Epic 3: Keep control of remediation`.

The Streamable HTTP endpoint exposes:

- `get_incident`
- `get_service_health`
- `list_recent_deployments`
- `search_error_logs`
- `get_runbook`
- `rollback_deployment` (write + destructive annotations)

The same process exposes `/api/snapshot`, `/api/reset`, and `/health` for the console and test harness. Only the MCP rollback tool changes operational state in the live product; `/api/reset` is localhost demo setup and is documented as such.

### TrueForge agent

Implements: `prd.md > Epic 2: Test competing explanations` and `Epic 3: Keep control of remediation`.

`scripts/register-agent.ts` saves the `fuseops-commander` manifest with the control-plane connector, approval required for `rollback_deployment`, sandbox enabled, dynamic subagents enabled, Generative UI enabled, and an iteration cap. The focused instructions require evidence before action and a sandbox correlation calculation.

### Incident simulator

Implements: `prd.md > Epic 1` and `Epic 4`.

An in-memory state machine starts with version `checkout-v43`, error rate `18.4`, and p95 latency `2140`. An approved rollback activates `checkout-v42`, lowers the metrics, resolves the incident, and appends audit events. Mutations are serialized and idempotent.

## File Structure

```text
.
├── apps/
│   ├── console/
│   │   ├── src/components/       # metric and timeline components
│   │   ├── src/replay.ts         # deterministic replay states
│   │   └── src/App.tsx           # live/replay shell + TrueForge iframe
│   └── control-plane/
│       ├── src/incident-store.ts  # deterministic state machine
│       ├── src/tools.ts           # MCP tool contracts and handlers
│       └── src/index.ts           # HTTP/MCP server
├── config/fuseops-agent.json      # auditable TrueForge agent spec
├── scripts/register-agent.ts      # installs/updates named agent
├── docs/hackathon-build/          # durable planning evidence
└── README.md                      # setup, architecture, Qodo evidence
```

## Data Flow

1. The operator selects `fuseops-commander` and sends the seeded incident prompt in the embedded TrueForge standalone client.
2. TrueForge resolves `fuseops-control-plane` and calls read-only MCP tools.
3. The MCP server reads the incident store and records evidence-access audit events.
4. TrueForge delegates hypotheses and uses its Daytona sandbox for a correlation script.
5. The agent calls `rollback_deployment` with incident ID, deployment ID, and evidence summary.
6. TrueForge sees the destructive annotation and explicit manifest policy, persists the pending call, and pauses.
7. After Allow, TrueForge executes the MCP call; the store atomically changes the active version and recovery metrics.
8. The console poll receives the new snapshot and updates the health strip and timeline.

## API Contracts

### `GET /health`

Returns `{ status: "ok", service: "fuseops-control-plane" }`.

### `GET /api/snapshot`

Returns `{ incident, service, deployments, audit }` with no secrets.

### MCP `rollback_deployment`

Input: `{ incident_id: string, deployment_id: string, evidence: string }`.

Success: a content result summarizing old/new versions and recovered metrics. Unknown, inactive, or mismatched deployments produce an MCP error result and no mutation.

## AI Usage

There is no direct model API call in FuseOps. All reasoning and action flow through TrueForge. The harness owns model selection, MCP routing, deferred tools, parallel subagents, sandbox execution, approvals, session persistence, streaming, and reconnect behavior.

## Risks And Verification

- **Standalone/API drift:** pin the locally verified TrueForge v0.1.4 command, keep the agent manifest as plain JSON, and use its documented list/create/update agent endpoints.
- **MCP transport mismatch:** contract-test initialize, tools/list, and tools/call through the official client SDK.
- **Approval bypass:** both destructive MCP annotations and explicit TrueForge agent policy gate rollback; tests verify the store cannot roll back an unrelated deployment.
- **Missing Daytona/model keys:** replay mode keeps UI evaluation possible, while README clearly separates replay from the required live judging path.
- **Local model latency/tool compliance:** CPU-only Docker inference may fail to emit tool calls within a demo window. Treat replay and MCP contracts as separate evidence; require a complete live run on a responsive cloud tool model or native Metal-accelerated local runtime before submission.
- **CORS/local ports:** use `VITE_TRUEFORGE_URL` for the proxied readiness check, `VITE_TRUEFORGE_EMBED_URL` for the iframe origin, and `VITE_CONTROL_PLANE_URL` for dashboard polling, all with documented local defaults.

## Demo And Submission Flow

The submission demo requires a clean reset, both workspace apps and TrueForge, a responsive tool-capable model, the recommended prompt, visible delegation/sandbox work, the real Allow/Deny gate, an approved mutation, and the recovered health strip plus audit record. Replay may supplement this story but cannot count as live-run proof.
