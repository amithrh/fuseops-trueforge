# FuseOps Three-Minute Demo

## Before recording

- Run `npm run check` and keep its green summary available.
- Start `npm run dev` and TrueForge on port 8790.
- Confirm `fuseops-control-plane` and `fuseops-commander` are configured.
- For the verified local path, start native Ollama on port 11435, select `ollama-metal/qwen3-14b`, and keep `reasoning_effort: none` in the registered manifest. A separate Docker instance may remain on port 11434.
- Pre-warm the model, then run one fresh smoke from reset through the real TrueForge approval card and verified recovery before recording. Session `01m19qc2w5b87hpa6z9dj0ds6y` is the preserved baseline.
- Reset the scenario. Keep the browser at 1440×900 or larger and increase page zoom only if text becomes small in the recording.

## Script

### 0:00–0:15 — Stakes

“Checkout is failing at 18.4%, seconds after a deploy. Incident teams need agent speed, but they cannot hand an LLM unrestricted production authority. FuseOps is an incident agent that earns permission to act.”

Show the incident headline, metrics, active release, and system path.

### 0:15–0:35 — The owned system

“FuseOps runs on TrueForge. It has six real tools on an MCP control plane I own: five gather evidence, and one can roll back the simulator. TrueForge also gives it isolated code execution, subagents, and a first-class human checkpoint.”

Briefly show the MCP tool list and the rollback annotations, or the README sponsor-proof section.

### 0:35–2:20 — Autonomous investigation

Enter Live harness, select **FuseOps Commander** from the embedded TrueForge agent library, reset the incident, paste the prepared prompt, and run it.

Narrate the evidence trail: incident context, health, deploys, logs, runbook; two competing subagent hypotheses; and the sandbox result of a 360-second deploy-to-incident interval with a 0.90 correlation score. Emphasize that read-only work is autonomous and observations are separated from inference.

Use Demo replay only as a clearly labeled supplemental UI walkthrough. It does not replace the required live proof or justify claims that the model, tools, sandbox, subagents, and approval boundary ran end to end.

### 2:20–2:40 — The control boundary

When the approval card appears:

“This is the core. The model has evidence, but not authority. TrueForge stops the exact `rollback_deployment` call. I can inspect the incident, deployment, target, and evidence, then deny or allow it.”

Pause for two seconds so the checkpoint is legible. Click **Allow rollback**.

### 2:40–2:55 — Recovery and audit

Show the headline change to “Checkout recovered,” error rate at 1.2%, p95 latency at 312 ms, active `v42`, and the completed audit trail.

“The mutation was atomic and idempotent. FuseOps verifies recovery instead of claiming success early, and the complete sequence stays inspectable.”

### 2:55–3:00 — Close

“FuseOps shows a practical pattern for trustworthy operational agents: autonomous evidence, isolated reasoning, explicit scope, and a person at the irreversible edge.”

## Required edit points

- Keep the video near three minutes.
- Show TrueForge visibly doing the work.
- Show the Qodo-reviewed PR link for two seconds.
- Avoid jump cuts across the approval moment.
