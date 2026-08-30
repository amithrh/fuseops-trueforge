import type { Snapshot } from "./types";

export const initialReplay: Snapshot = {
  incident: {
    id: "inc-checkout-2026-08-30",
    title: "Checkout payment failures above SLO",
    severity: "SEV-1",
    status: "investigating",
    service: "checkout-api",
    startedAt: "2026-08-30T11:04:00.000Z",
    symptom: "Payment authorization failures increased immediately after checkout-v43 reached production.",
  },
  service: {
    service: "checkout-api",
    activeVersion: "checkout-v43",
    errorRatePct: 18.4,
    p95LatencyMs: 2140,
    requestsPerMinute: 8420,
    region: "us-west-2",
    sampledAt: "2026-08-30T11:12:00.000Z",
  },
  deployments: [
    {
      id: "deploy-checkout-v43",
      version: "checkout-v43",
      commit: "4c21f0a",
      deployedAt: "2026-08-30T10:58:00.000Z",
      change: "Retry payment authorization on ambiguous gateway timeouts",
      active: true,
    },
    {
      id: "deploy-checkout-v42",
      version: "checkout-v42",
      commit: "ae091d3",
      deployedAt: "2026-08-29T15:20:00.000Z",
      change: "Add payment gateway request tracing",
      active: false,
    },
  ],
  audit: [
    {
      id: "event-opened",
      at: "2026-08-30T11:04:00.000Z",
      kind: "incident.opened",
      actor: "simulator",
      summary: "SEV-1 opened for checkout payment failures",
      detail: "Error rate crossed 15% for five minutes.",
    },
  ],
};

export const replaySteps = [
  { kind: "evidence.read", summary: "Metrics sampled — error rate is 18.4%", actor: "trueforge-agent" },
  { kind: "evidence.read", summary: "Deploy 4c21f0a aligned to incident onset", actor: "trueforge-agent" },
  { kind: "subagent.completed", summary: "3 hypotheses tested in parallel", actor: "trueforge-agent" },
  { kind: "sandbox.completed", summary: "Correlation script: deploy ↔ failures = 0.94", actor: "trueforge-agent" },
  { kind: "approval.waiting", summary: "Rollback held for human approval", actor: "trueforge-agent" },
] as const;

export function recoverReplay(snapshot: Snapshot): Snapshot {
  const at = new Date().toISOString();
  return {
    ...snapshot,
    incident: { ...snapshot.incident, status: "resolved" },
    service: {
      ...snapshot.service,
      activeVersion: "checkout-v42",
      errorRatePct: 1.2,
      p95LatencyMs: 312,
      sampledAt: at,
    },
    deployments: snapshot.deployments.map((deployment) => ({
      ...deployment,
      active: deployment.version === "checkout-v42",
    })),
    audit: [
      ...snapshot.audit,
      {
        id: "event-rollback",
        at,
        kind: "rollback.completed",
        actor: "human-approved",
        summary: "checkout-v43 rolled back to checkout-v42",
        detail: "Replay only — live mode uses TrueForge's authoritative Allow/Deny checkpoint.",
      },
      {
        id: "event-resolved",
        at,
        kind: "incident.resolved",
        actor: "simulator",
        summary: "Checkout error rate recovered to 1.2%",
      },
    ],
  };
}

