# Build Checklist

## Build Preferences

- **Build mode:** Autonomous
- **Comprehension checks:** N/A
- **Git:** Initialize locally, build on a feature branch, and create small commits suitable for one Qodo-reviewed PR.
- **Verification:** Automated at each layer; participant visual check only after the MVP is complete.
- **Check-in cadence:** Speed-run; notify the participant when ready to test.
- **Wow moment:** The exact instant the evidence-complete agent stops at the rollback boundary, then the metrics visibly recover after one human approval.

## Checklist

- [x] **1. Scaffold the typed workspace**
  Spec ref: `spec.md > Stack`
  What to build: npm workspaces, shared scripts, TypeScript/Vite/Vitest configuration, and environment examples.
  Acceptance: A fresh install resolves both applications and all source files typecheck.
  Verify: `npm install && npm run typecheck`.

- [x] **2. Implement the incident state machine**
  Spec ref: `spec.md > Incident simulator`
  What to build: Seeded checkout incident, metrics, deployments, audit events, atomic guarded rollback, and reset.
  Acceptance: Denial/no-call changes nothing; wrong deployments fail; the correct rollback is idempotent and produces recovery.
  Verify: `npm run test --workspace @fuseops/control-plane`.

- [x] **3. Expose real MCP tools**
  Spec ref: `spec.md > FuseOps control-plane MCP server`
  What to build: Streamable HTTP MCP transport, five read-only tools, destructive rollback tool, health and snapshot endpoints.
  Acceptance: Official MCP client can initialize, list tools, read evidence, and execute a safe test rollback.
  Verify: MCP contract tests plus `curl http://localhost:3100/health`.

- [x] **4. Define and register the TrueForge agent**
  Spec ref: `spec.md > TrueForge agent`
  What to build: Auditable agent JSON and idempotent registration script with MCP approval, sandbox, subagents, and instructions.
  Acceptance: Manifest requires evidence, sandbox correlation, delegation, and approval for rollback.
  Verify: `npm run agent:preview`, followed by repeated registration against local TrueForge to exercise create-or-update behavior.

- [x] **5. Build the operator console foundation**
  Spec ref: `spec.md > Operator console`
  What to build: Responsive visual shell, incident header, metric cards, system map, connection status, and live snapshot polling.
  Acceptance: A judge can understand severity, affected service, active version, and current health in five seconds.
  Verify: Component and replay-state tests, production build, and browser screenshots at desktop/mobile sizes.

- [x] **6. Embed TrueForge and safety UX**
  Spec ref: `spec.md > Operator console`
  What to build: Embedded TrueForge standalone client, investigation prompt, evidence timeline, and visible waiting/recovery states.
  Acceptance: Live mode exposes the official TrueForge trace and approval card without hiding harness behavior.
  Verify: Production build, live iframe/composer smoke, and the real approval-card execution passed; see step 11.

- [x] **7. Add deterministic replay mode**
  Spec ref: `spec.md > Operator console`
  What to build: Clearly labeled replay controls and a timed fixture covering evidence, delegation, sandbox, approval wait, and recovery.
  Acceptance: UI and demo story can be evaluated without API credentials, and replay cannot be mistaken for a live run.
  Verify: Vitest checks the replay-state boundary and recovery transformation; desktop/mobile browser review exercises start, deny, allow, and recovered states.

- [x] **8. Harden quality and safety**
  Spec ref: `spec.md > Risks And Verification`
  What to build: Validation, CORS policy, error states, idempotency tests, type/build checks, and secret scan.
  Acceptance: Test suite covers safety invariants and no credential-like material is tracked.
  Verify: `npm run check` and repository secret grep.

- [x] **9. Write the public repository and demo materials**
  Spec ref: `spec.md > Demo And Submission Flow`
  What to build: README, architecture diagram, setup/runbook, three-minute script, screenshot list, Qodo evidence section, license, and contribution notes.
  Acceptance: A stranger can clone, configure, run, and explain FuseOps.
  Verify: Follow README from a clean install and check every referenced command.

- [x] **10. Prepare submission handoff**
  Spec ref: `prd.md > Submission Proof Points`
  What to build: Submission write-up, honest limitations, testing instructions, form-answer draft, PR description, and final readiness checklist.
  Acceptance: The handoff separates verified technical evidence from account-owned submission steps.
  Verify: Review the handoff and ensure the completed live run is documented without claiming unfinished Qodo, publishing, video, or form work.

- [x] **11. Prove the live approval boundary before submission**
  Spec ref: `spec.md > Demo And Submission Flow`
  What to verify: Run a responsive tool-capable model through TrueForge evidence calls, sandbox/subagents, the real rollback approval card, approved mutation, and recovery check.
  Verify: Native Metal `ollama-metal/qwen3-14b` completed session `01m19qc2w5b87hpa6z9dj0ds6y` in 2m12s: five root evidence calls, two subagents, one sandbox result (`360`, `0.90`), the real approval card, approved rollback, and verified recovery.

## Completion evidence

- `npm run check`: type-check, 16 tests, and two production builds passed on 2026-08-30.
- MCP contract: initialize, tool discovery, evidence read, destructive annotations, and guarded mutation passed.
- Browser: 1440 px desktop and 390 px mobile layouts reviewed; replay states and recovery interaction verified.
- TrueForge configuration: local capabilities, provider, six-tool MCP connection, agent manifest, approval policy, and embedded responsive composer verified.
- TrueForge live execution: verified end to end in session `01m19qc2w5b87hpa6z9dj0ds6y`; one root approval request changed `checkout-v43` to `checkout-v42`, followed by 1.2%/312ms/resolved post-checks.
- Documentation: public README, MIT license, contribution policy, three-minute script, PR description, and submission answers created.
- Remaining prerequisites: participant hands-on test, public repository, Qodo review/merge evidence, fresh-clone check, video upload, remaining placeholders, and manual form submission.
