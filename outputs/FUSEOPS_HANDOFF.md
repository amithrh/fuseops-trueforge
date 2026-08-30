# FuseOps Final Handoff

## Status

Ready for participant testing. The local product, safety workflow, documentation, and submission draft are complete. The hackathon form has not been submitted.

## Verified locally

- TypeScript checks: passed
- Automated tests: 12 passed
- Production builds: console and control plane passed
- MCP contract: six tools discovered; rollback marked destructive and guarded
- Desktop UI: passed at 1440 px
- Mobile UI: passed at 390 px
- TrueForge local capabilities: sandbox, skills, and settings available
- TrueForge MCP/agent configuration: `fuseops-control-plane` and `fuseops-commander` registered locally
- Embedded live client: responsive TrueForge composer visible with no browser console errors

## Your hands-on test

The development services are intended to run at:

- FuseOps console: http://127.0.0.1:4173
- FuseOps health: http://127.0.0.1:3100/health
- TrueForge: http://localhost:8790

In FuseOps, test **Demo replay** first:

1. Click **Run investigation**.
2. Wait for the human checkpoint.
3. Confirm the proposed deployment is `checkout-v43` and target is `checkout-v42`.
4. Click **Allow rollback**.
5. Confirm “Checkout recovered,” 1.2% errors, and active `v42`.

Then test **Live harness**:

1. Ensure TrueForge is running and select **FuseOps Commander**.
2. Reset the scenario.
3. Copy the demo prompt from FuseOps and run it in TrueForge.
4. Confirm read-only MCP evidence, at least two hypotheses, a sandbox correlation script, and the paused rollback call.
5. Review and approve the exact call, then confirm recovery.

## Account-owned finish line

1. Create a public GitHub repository and install/enable Qodo review.
2. Push `main` and the prepared feature branch.
3. Open a PR using `docs/PR_DESCRIPTION.md`; resolve Qodo feedback and merge it.
4. Replace the Qodo placeholders in README and `wemakedevs-submission.md` with the real review outcome.
5. Record the approximately three-minute video using `docs/demo-script.md` and add its public URL.
6. Replace all remaining URL, rating, and feedback placeholders in `wemakedevs-submission.md`.
7. Complete both pages of the official WeMakeDevs Google Form and submit it yourself.

Do not submit before the Qodo evidence link and public video URL are present.
