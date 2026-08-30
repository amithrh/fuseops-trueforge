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
full live model → tools → approval → recovery run pending on a responsive provider
```

The pending live run is a submission gate, not a passing claim: Docker-hosted CPU-only Qwen3 14B remained in its first generation for 5m24s and emitted no tool call before cancellation.

## Qodo checklist

- [ ] Review the rollback authorization boundary and state invariants.
- [ ] Review MCP input validation and destructive annotations.
- [ ] Review replay labeling for misleading model claims.
- [ ] Review setup instructions and AI disclosure.
- [ ] Add the reviewed PR URL to README and submission draft.
