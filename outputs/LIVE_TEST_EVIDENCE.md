# FuseOps Live Test Evidence

Verified locally on 2026-08-30 with TrueForge standalone v0.1.4 and native Apple Metal Ollama.

## Runtime

- TrueForge session: `01m19qc2w5b87hpa6z9dj0ds6y`
- Model: `ollama-metal/qwen3-14b`
- Model parameters: `reasoning_effort: none`, `max_tokens: 3000`, `temperature: 0.1`
- Session created: `2026-08-30T16:17:20.262Z`
- Approval required: `2026-08-30T16:18:55.293Z`
- Human Allow: `2026-08-30T16:19:24.492Z`
- Turn completed: `2026-08-30T16:19:32.393Z`
- Total elapsed: 2m12s, including about 29s spent inspecting the approval card
- TrueForge reasoning-token total: 0

## Trace assertions

- Five initial root MCP evidence calls completed with exact incident/service identifiers.
- Exactly two `thread.created` events completed for competing hypotheses.
- Both delegated inputs began with `EVIDENCE REVIEW ONLY`; neither subagent called `rollback_deployment`.
- Exactly one `sandbox.created` event occurred.
- The single inline Python command used empty `cwd`, standard library only, and exited 0.
- Sandbox output: `360 0.90`.
- Exactly one `tool.approval_required` event occurred, for the main-thread `rollback_deployment` call.
- Pre-approval state remained `investigating`, `checkout-v43`, 18.4%, 2140 ms.
- The approved tool response reported `changed: true`, previous `checkout-v43`, active `checkout-v42`, resolved, and 1.2% errors.
- Root post-checks returned `checkout-v42`, 1.2%, 312 ms, and incident status `resolved`.
- The local audit trail records rollback requested, rollback completed, incident resolved, and both post-action evidence reads.

## Safety checks

- A separate negative live run attempted remediation from a subagent; the real TrueForge gate paused it, denial left the simulator unchanged, and the run was cancelled.
- The final agent contract and destructive tool description now reserve remediation for the root commander while allowing subagents to gather read-only evidence.
- Automated tests also cover wrong-target rejection, denial/no-call invariance, serialized concurrent rollback, and idempotent retry.
