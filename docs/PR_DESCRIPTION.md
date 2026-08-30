# PR: Build FuseOps, an approval-gated TrueForge incident agent

## Summary

This PR adds the FuseOps implementation: a responsive incident console, owned MCP control plane, guarded incident state machine, TrueForge agent manifest, deterministic replay, automated tests, and submission documentation.

## Why

FuseOps demonstrates that an operational agent can investigate broadly while keeping irreversible authority narrow. It makes the approval boundary—not unchecked autonomy—the product's main interaction.

## Review map

- `apps/control-plane/src/incident-store.ts`: guarded, idempotent state mutation
- `apps/control-plane/src/tools.ts`: MCP schemas and safety annotations
- `config/fuseops-agent.json`: TrueForge instructions, subagents, sandbox, approval requirement
- `apps/console/src/App.tsx`: embedded standalone harness, legible audit trail, honest replay
- `*.test.ts`: evidence validation, wrong-deployment rejection, idempotency, MCP contracts, replay-state behavior, accessibility, and disconnected-state handling

## Verification

```text
npm run check
16 tests passed
console production build passed
control-plane production build passed
desktop and 390px mobile browser review passed
TrueForge capabilities, saved agent, iframe, and six-tool MCP discovery passed locally
live session 01m19qc2w5b87hpa6z9dj0ds6y passed: 2 subagents, sandbox 360/0.90, root approval, v43 → v42, 1.2%/312ms/resolved
```

The verified live run used native Apple Metal Qwen3 14B with `reasoning_effort: none` and completed in 2m12s including the human approval review. The earlier CPU-only Docker failure remains documented as a reproducible learning, not a passing claim.

## Qodo checklist

- [ ] Review the rollback authorization boundary and state invariants.
- [ ] Review MCP input validation and destructive annotations.
- [ ] Review replay labeling for misleading model claims.
- [ ] Review setup instructions and AI disclosure.
- [ ] Add the reviewed PR URL to README and submission draft.
