# FuseOps — WeMakeDevs Submission Packet

This file mirrors the official two-page Google Form inspected on 2026-08-30. The participant reported completing the form submission on 2026-08-31; if Google Forms still offers **Edit response**, use the verified Qodo text below to replace any earlier pending-Qodo answer.

**Live proof complete:** TrueForge session `01m19qc2w5b87hpa6z9dj0ds6y` completed the real MCP tools, two subagents, sandbox calculation, approval, rollback, and verified recovery path on 2026-08-30. The public repository, video, and Qodo review trail are now available.

## Required assets

- Public GitHub repository: https://github.com/amithrh/fuseops-trueforge
- Representative Qodo-reviewed PR: https://github.com/amithrh/fuseops-trueforge/pull/1
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

https://github.com/amithrh/fuseops-trueforge

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

Qodo reviewed the representative FuseOps rollback-hardening PR (https://github.com/amithrh/fuseops-trueforge/pull/1) and found a high-severity correctness issue: after a completed rollback, different evidence could be accepted as an idempotent retry, which could reuse approval for different tool arguments. We accepted the finding, bound retries to the original normalized evidence, added a conflicting-evidence regression test, and ran a follow-up review. Qodo marked the finding resolved. Qodo later questioned the test count after overlooking four `App.test.tsx` cases; we verified the actual 23-case runner output, clarified the four-file breakdown, and documented the reasoned decision in the public PR.

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

Choose the participant's honest score from 1–5. The review produced a concrete high-severity fix, while its later test-count finding required manual verification because it omitted one test file.

### Most useful or frustrating part of Qodo, and what would you change? — required

The most useful part was Qodo connecting exact-request idempotency to TrueForge's approval contract; it caught that different retry evidence could silently reuse an earlier approval. The frustrating part was a later test-count finding that omitted `App.test.tsx` and reported 19 instead of the runner's 23 cases. I would improve Qodo by having documentation findings reconcile against actual test-runner output and discover every matching test file before reporting a count mismatch.

### Which PR stood out most when working with Qodo, and why? — required

The FuseOps rollback-domain PR (https://github.com/amithrh/fuseops-trueforge/pull/1) stood out because it covered the highest-risk product boundary: a destructive state transition after human approval. Qodo found that changed evidence could be accepted as a retry, we fixed it and added a regression test, and Qodo marked the finding resolved in its follow-up review.

## Official compliance checklist

- [x] Full live project run visibly completes in TrueForge on a responsive provider.
- [x] Owned MCP tools perform real calls through the official MCP client contract tests.
- [x] Agent instructions require sandbox execution and subagents.
- [x] Real TrueForge approval card is reached and proven before the destructive rollback.
- [x] No customer data or production credentials are used.
- [x] Clear setup README, AI disclosure, tests, and open-source license exist.
- [x] Publish the GitHub repository.
- [x] Install Qodo on that repository before opening the implementation PR.
- [x] Obtain initial Qodo review, respond to findings, push fixes, and obtain follow-up review.
- [ ] Human-merge the reviewed PR.
- [x] Replace the README Qodo evidence placeholder with the real PR, findings, decisions, and follow-up outcome.
- [x] Complete and preserve evidence from the live TrueForge tools → sandbox/subagents → approval → recovery run.
- [ ] Run the README from a fresh clone and confirm `npm run check` passes.
- [x] Render, verify, and upload the final YouTube demo (2:30): https://youtu.be/wkmzrRd3BYA
- [ ] Confirm the participant-selected TrueForge and Qodo ratings if editing the response.
- [x] Participant reported completing both form pages and the final submission personally.

## Recommended order

1. Perform the participant hands-on test.
2. Public repository and Qodo installation.
3. Push `main` and `feat/fuseops-incident-commander`; open the prepared PR.
4. Resolve Qodo findings, request follow-up review, and merge.
5. Update README and this packet with the real Qodo evidence.
6. Fresh-clone smoke test and secret scan.
7. Use the verified YouTube demo at https://youtu.be/wkmzrRd3BYA.
8. Complete both pages of the WeMakeDevs form and review every URL before submitting.
