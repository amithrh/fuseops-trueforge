export type IncidentStatus = "investigating" | "resolved";

export interface Snapshot {
  incident: {
    id: string;
    title: string;
    severity: "SEV-1";
    status: IncidentStatus;
    service: string;
    startedAt: string;
    symptom: string;
  };
  service: {
    service: string;
    activeVersion: string;
    errorRatePct: number;
    p95LatencyMs: number;
    requestsPerMinute: number;
    region: string;
    sampledAt: string;
  };
  deployments: Array<{
    id: string;
    version: string;
    commit: string;
    deployedAt: string;
    change: string;
    active: boolean;
  }>;
  audit: Array<{
    id: string;
    at: string;
    kind: string;
    actor: string;
    summary: string;
    detail?: string;
  }>;
}

export type RunMode = "live" | "replay";

