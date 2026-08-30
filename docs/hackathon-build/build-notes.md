# Build Notes

## 2026-08-30 — Research and planning

- The participant requested a fully autonomous research-to-build flow and asked to be notified only when the project is ready for hands-on testing.
- Official event research found six equally weighted criteria: impact, originality, technical excellence, sponsor-tool use, control and safety, and presentation.
- Mandatory constraints recorded: TrueForge must visibly do real work; all substantive changes need Qodo-reviewed pull requests; public repository; approximately three-minute demo; README Qodo evidence; disclose AI assistance.
- Chose FuseOps over a generic research or code-review agent because incident remediation naturally demonstrates tool access, sandboxing, subagents, session durability, and a meaningful approval boundary in one coherent job.
- Scope deepening rounds: 1 autonomous review. Cut real cloud credentials, multi-tenancy, and multiple incident types to protect the demo path.
- PRD deepening rounds: 1 autonomous edge-case review. Added denial/no-op, wrong-deployment, idempotency, disconnected-state, and replay-label requirements.
- Spec deepening rounds: 1 architecture self-review. Added dual approval enforcement and contract testing around MCP transport.
- Checklist mode: autonomous speed-run, no participant pauses until MVP visual testing.
- Active shaping note: no user-specific visual taste was supplied, so the interface direction is a calm flight-recorder operations console rather than a generic dashboard.

## 2026-08-30 — Pre-submission live verification

- Replay flows, automated checks, MCP contracts, TrueForge configuration/discovery, and the embedded client passed.
- The first end-to-end live attempt did not reach a tool call: Docker-hosted CPU-only Qwen3 14B remained in its first generation for 5m24s before cancellation.
- A smaller 7B direct smoke also emitted no tool call within 60 seconds, so model size alone is not accepted as proof of a working live path.
- Submission remains gated on a responsive tool-capable cloud model or native Metal-accelerated Ollama completing tools, sandbox/subagents, approval, mutation, and recovery.
