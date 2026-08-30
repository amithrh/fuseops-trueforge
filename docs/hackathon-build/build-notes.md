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
- Host-native Ollama on port 11435 loaded the existing Qwen3 14B blobs fully on Apple Metal without disturbing the Docker instance on port 11434.
- Direct OpenAI-compatible verification showed `reasoning_effort: none` disables optional Qwen thinking. The capability was advertised on the separate `ollama-metal` provider and saved in the agent manifest.
- A safety test caught a subagent attempting remediation: TrueForge paused the destructive call, denial left the simulator unchanged, and the run was cancelled. The final contract reserves rollback for the root commander and labels the destructive tool accordingly.
- Final live session `01m19qc2w5b87hpa6z9dj0ds6y` completed in 2m12s including 29s of human review: five initial MCP reads, exactly two evidence-review subagents, one successful sandbox result (`360`, `0.90`), one root approval request, approved rollback, and 1.2%/312ms/resolved post-checks.
- The technical submission gate is complete; public GitHub/Qodo evidence, video, subjective ratings, and form submission remain account-owned.
