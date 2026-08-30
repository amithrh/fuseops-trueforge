# Project Scope

## Project Name Candidates

- **FuseOps** — selected; memorable, safety-oriented, and easy to say in a demo.
- ChangeSafe
- Rollback Sentinel

## One-Line Summary

FuseOps is a TrueForge incident agent that investigates payment failures with real tools, proves the likely cause in a sandbox, and earns human permission before it changes production state.

## Target User

An on-call engineer responsible for a small but business-critical service who needs fast evidence without surrendering control of irreversible actions.

## Problem

Incident response is split across telemetry, deploy history, runbooks, and risky control surfaces. Chatbots can summarize an alert, but the useful work is acting: gathering evidence, testing hypotheses, and performing a remediation safely. Existing demos often hide the safety boundary or use tools only as decoration.

## Core Workflow

1. An operator opens the seeded `payment-failures` incident.
2. FuseOps reads live metrics, recent deploys, logs, and the runbook through the `fuseops-control-plane` MCP server.
3. TrueForge delegates latency, deploy, and dependency hypotheses to focused subagents.
4. The root agent writes and runs a small correlation script in the TrueForge sandbox.
5. FuseOps proposes rolling back the implicated deployment, showing expected impact and evidence.
6. TrueForge pauses on the destructive MCP tool until the operator allows or denies it.
7. The control-plane tool applies the approved rollback to the owned simulator and appends an immutable audit event.
8. The UI shows recovery and the complete decision trail; refreshing the page preserves the TrueForge session.

## What We Are Building

- A real Streamable HTTP MCP server backed by an owned incident simulator.
- Read-only tools for metrics, deploys, logs, runbooks, and current service state.
- A destructive rollback tool annotated so TrueForge gates it for human approval.
- A TrueForge agent manifest with sandbox, subagents, Generative UI, and bounded iterations enabled.
- A distinctive operations console embedding the official TrueForge UI SDK.
- A deterministic replay mode so judges can inspect the interface without credentials.
- Automated unit, contract, and browser tests.
- Public-repo documentation, demo script, Qodo evidence placeholder, and submission copy.

## What We Are Not Building

- A real production cloud integration: it would require privileged accounts and make a safe public demo harder.
- Multi-tenant authentication: local mode is enough for the hackathon demo.
- A generic incident platform: one complete payment-failure workflow is stronger than several partial workflows.
- Automatic rollback without approval: that would contradict the product promise and the judging criteria.
- Custom model orchestration outside TrueForge: the harness must visibly own the loop.

## Inspiration And References

- Incident.io and Rootly: clear incident timelines and operator-focused status.
- Linear: dense information hierarchy with calm, precise interactions.
- Flight recorder interfaces: evidence-first chronology and unambiguous state changes.
- TrueForge's own incident-responder example, expanded into a product-quality, owned-system demo.

## Time Budget

One focused build day before the August 30, 8:00 PM London deadline. Scope is intentionally limited to one seeded incident and one safe remediation.

## Demo Path

The three-minute demo begins with checkout errors at 18.4%. FuseOps independently gathers evidence, delegates hypotheses, and runs a correlation script. The audience then sees the exact moment the rollback tool pauses with its arguments. The operator approves; metrics recover to 1.2%; the audit trail records who approved what and why.

## Submission Story

Most incident agents optimize speed. FuseOps optimizes justified action: it shows how an agent harness can make autonomy safer, more legible, and more trustworthy than a plain chatbot.

