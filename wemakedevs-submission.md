# FuseOps — WeMakeDevs Submission Packet

Nothing has been sent to the WeMakeDevs form. This file mirrors the official two-page Google Form inspected on 2026-08-30.

**Live proof complete:** TrueForge session `01m19qc2w5b87hpa6z9dj0ds6y` completed the real MCP tools, two subagents, sandbox calculation, approval, rollback, and verified recovery path on 2026-08-30. The form remains unsubmitted until the public repository, Qodo trail, ratings, and remaining required fields below are complete.

## Required assets

- Public GitHub repository: `PUBLIC_REPOSITORY_URL`
- Representative merged Qodo-reviewed PR: `QODO_REVIEWED_PR_URL`
- Public or unlisted YouTube video, no longer than three minutes: https://youtu.be/wkmzrRd3BYA
- Optional deployed application: not applicable; FuseOps is a local-only TrueForge demonstrator
- Optional blog post: not published

## Page 1 — Project submission

### Email — required

Collected automatically by Google Forms from the signed-in account.

### Team name — required

`SOLO`

### Name of the person submitting the form — required

`Amit Mishra` — verify preferred capitalization before entering.

### Track you are submitting for — required, multi-select

- [x] Best Use of TrueForge (NVIDIA DGX Spark)
- [x] Best Code Quality (Mac Mini)
- [x] Best UI (Apple iPads for all team members)
- [ ] Best Blog Post (Keychron Keyboard) — select only after publishing the optional blog

The same project may enter every track, but can win only one.

### GitHub link to project — required

`PUBLIC_REPOSITORY_URL`

The repository must be public, include a usable README, and retain a real commit and pull-request history.

### Deployed link to project — optional

Leave blank. FuseOps is intentionally a local-only TrueForge demonstrator.

### YouTube video demo link — required

https://youtu.be/wkmzrRd3BYA

Verified published duration: 2 minutes 30 seconds. The recording shows the project, stack and architecture, working demo, TrueForge tool use, sandbox/subagent evidence, the approval boundary, and verified recovery.

### What does your project do? — required

FuseOps is an approval-gated incident-response agent for SRE and platform teams. When checkout payment failures spike, it gathers incident context, service health, deploy history, sanitized logs, and the runbook through an owned MCP control plane. It delegates competing hypotheses, quantifies deploy/error correlation in an isolated sandbox, proposes the exact rollback, and stops until a human approves. After approval it performs a guarded, idempotent rollback and verifies recovery. The demo uses an owned local simulator and no customer data, proving that agents can investigate autonomously without receiving unchecked operational authority.

### How did you use TrueForge in your project? — required

TrueForge is the runtime rather than a thin wrapper. The FuseOps agent runs through a durable TrueForge session and connects to six owned MCP tools: five read-only evidence tools and one destructive rollback tool. Its manifest requires dynamic subagents to test competing causes and a TrueForge sandbox script to measure correlation. TrueForge then pauses the exact rollback tool call for human approval. The live UI exposes the agent trace and approval boundary, while FuseOps records the resulting recovery state and audit trail.

### How did you use Qodo in your project? — required

`COMPLETE_AFTER_QODO_REVIEW:` Qodo reviewed the representative FuseOps implementation PR (`QODO_REVIEWED_PR_URL`) and surfaced `QODO_FINDING_SUMMARY`. We `QODO_DECISION_AND_CHANGE`, then pushed the update and ran a follow-up review against the final code. This improved `QODO_QUALITY_OUTCOME`. The complete discussion and decision trail remain public in the merged PR.

Do not replace these placeholders with invented claims; use the actual review findings.

### Blog link — optional

Leave blank; no blog was published. Do not select the Best Blog Post track.

## Page 2 — Required feedback

### How easy was it to get your first agent running with TrueForge? — required

Choose an honest score from 1–5 after the participant's hands-on run: `TRUEFORGE_EASE_SCORE`.

### Which TrueForge feature was most useful, and why? — required

The human approval checkpoint was the most valuable feature because it let FuseOps investigate independently while keeping the irreversible rollback under operator control. MCP orchestration made that boundary concrete: read-only evidence calls proceeded automatically, while the specifically annotated destructive call paused with inspectable arguments.

### Where did you get stuck with TrueForge, and what would you improve? — required

The embeddable UI dependency graph pulled incompatible peer versions of Zustand through the assistant and OpenUI packages, so we stabilized the console by embedding TrueForge's standalone client in an isolated frame. Local model guidance was another friction point: Docker-hosted CPU-only Qwen3 14B spent 5m24s in its first generation without emitting a tool call. Moving the same model to native Apple Metal and advertising `reasoning_effort: none` solved it; the verified run then completed in 2m12s. Clearer iframe/base-path documentation plus explicit guidance on local acceleration, reasoning controls, and subagent tool inheritance would improve the experience.

### How useful was Qodo’s code-review feedback? — required

Choose an honest score from 1–5 after review: `QODO_USEFULNESS_SCORE`.

### Most useful or frustrating part of Qodo, and what would you change? — required

`COMPLETE_AFTER_QODO_REVIEW:` describe one actual useful behavior or friction point and one concrete improvement. Do not invent review experience.

### Which PR stood out most when working with Qodo, and why? — required

The representative FuseOps implementation PR (`QODO_REVIEWED_PR_URL`) stood out because it covered the highest-risk product boundary: evidence-first MCP investigation followed by the guarded rollback state transition. Add the specific Qodo finding and resulting decision after the follow-up review.

## Official compliance checklist

- [x] Full live project run visibly completes in TrueForge on a responsive provider.
- [x] Owned MCP tools perform real calls through the official MCP client contract tests.
- [x] Agent instructions require sandbox execution and subagents.
- [x] Real TrueForge approval card is reached and proven before the destructive rollback.
- [x] No customer data or production credentials are used.
- [x] Clear setup README, AI disclosure, tests, and open-source license exist.
- [ ] Publish the GitHub repository.
- [ ] Install Qodo on that repository before opening the implementation PR.
- [ ] Obtain initial Qodo review, respond to findings, push fixes, and obtain follow-up review.
- [ ] Human-merge the reviewed PR.
- [ ] Replace the exact README Qodo evidence placeholders with the merged PR and real review outcome.
- [x] Complete and preserve evidence from the live TrueForge tools → sandbox/subagents → approval → recovery run.
- [ ] Run the README from a fresh clone and confirm `npm run check` passes.
- [x] Render, verify, and upload the final YouTube demo (2:30): https://youtu.be/wkmzrRd3BYA
- [ ] Fill the remaining Qodo and rating placeholders above.
- [ ] Complete both form pages and perform the final form submission personally.

## Recommended order

1. Perform the participant hands-on test.
2. Public repository and Qodo installation.
3. Push `main` and `feat/fuseops-incident-commander`; open the prepared PR.
4. Resolve Qodo findings, request follow-up review, and merge.
5. Update README and this packet with the real Qodo evidence.
6. Fresh-clone smoke test and secret scan.
7. Use the verified YouTube demo at https://youtu.be/wkmzrRd3BYA.
8. Complete both pages of the WeMakeDevs form and review every URL before submitting.
