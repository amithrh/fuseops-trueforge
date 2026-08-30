# Product Requirements Document

## Product Summary

FuseOps turns a noisy production alert into an evidence-backed, approval-gated remediation. TrueForge is the execution environment: it maintains the session, calls MCP tools, delegates research, runs diagnostics in a sandbox, and pauses before rollback.

## Target User

Primary: an on-call engineer handling a checkout incident. Secondary: an engineering leader or judge verifying that the agent is safe, observable, and reproducible.

## Core User Journey

The first screen shows a single active `SEV-1` incident and a calm invitation to investigate. The operator starts the suggested prompt. As the run progresses, the console shows live service health, evidence collected, delegation activity, and the TrueForge trace. When a rollback is proposed, the interface explains the affected deployment and expected outcome, while TrueForge presents the authoritative Allow/Deny checkpoint. After approval, the console shows recovery and a durable audit record.

## Epics And User Stories

### Epic 1: Understand the incident

- As an on-call engineer, I want the agent to inspect current metrics, recent deploys, error logs, and the runbook so that its diagnosis is grounded in systems I control.

Acceptance criteria:

- The demo begins with checkout error rate above 15% and an active alert.
- At least four read-only MCP tools return consistent incident evidence.
- The UI distinguishes observed facts from the agent's conclusions.
- Missing or unknown incident IDs produce a clear, non-destructive error.

### Epic 2: Test competing explanations

- As an operator, I want the agent to delegate independent hypotheses and calculate correlation in a sandbox so that one plausible story is not mistaken for proof.

Acceptance criteria:

- The agent instructions explicitly require at least two focused subagents for the demo incident.
- The recommended prompt asks for a generated diagnostic script and its result.
- The resulting trace visibly includes subagent and sandbox work when those capabilities are configured.
- The final diagnosis cites the deploy, timing, and measured error-rate change.

### Epic 3: Keep control of remediation

- As an operator, I want every state-changing action to pause for my decision so that the agent cannot silently change the service.

Acceptance criteria:

- `rollback_deployment` is marked write/destructive in MCP metadata.
- The TrueForge agent manifest additionally requires approval for that exact tool.
- Read-only investigation does not require approval.
- Denying approval leaves the simulator unchanged.
- Allowing approval rolls back only the currently active implicated deployment.

### Epic 4: See what happened

- As an operator, I want a clear timeline and audit record so that I can reconstruct the agent's evidence, proposal, approval, and outcome.

Acceptance criteria:

- The console shows incident severity, error rate, p95 latency, active version, and deploy marker.
- Tool and rollback events appear chronologically with timestamps.
- Recovery appears without a page reload after an approved rollback.
- TrueForge session history remains available after reconnect or refresh.

### Epic 5: Run and judge the project

- As a judge, I want a documented setup, replay mode, tests, and a short demo path so that I can understand the product even if I do not configure paid credentials.

Acceptance criteria:

- `npm run dev` launches the console and simulator.
- `npm test` validates state transitions and safety invariants.
- Replay mode renders the complete visual story with no secrets.
- The README explains TrueForge, MCP, sandbox, subagents, approval, Qodo, and limitations.

## Edge Cases

- A rollback request for a non-active or unknown deployment returns an error and changes nothing.
- Repeating an already completed rollback is idempotent and reports the existing state.
- Multiple concurrent rollback calls are serialized so only one state transition is recorded.
- The UI displays a useful disconnected state when either TrueForge or the control-plane server is unavailable.
- Demo replay is visibly labeled and cannot be confused with a live TrueForge run.
- Secrets and personal data never appear in fixtures, API responses, screenshots, or repository files.

## What We Are Building

- One seeded checkout incident.
- One evidence-rich investigation path.
- One approval-gated rollback and measurable recovery.
- One polished console with live and replay modes.

## What We Would Add With More Time

- GitHub issue creation after the incident is resolved.
- Pluggable OpenTelemetry and Kubernetes connectors.
- Policy-as-code approval rules and multi-approver workflows.
- Evaluation runs comparing diagnosis quality and time-to-mitigation.

## Submission Proof Points

- TrueForge is visible and central, not hidden behind a custom model call.
- The MCP server is real, runnable, and stateful.
- Sandbox and subagents serve the diagnosis rather than checking feature boxes.
- Approval happens before the destructive call.
- The public UI communicates state, waiting, evidence, and outcome.
- Tests prove denial, idempotency, and rollback safety.

