export type IncidentStatus = "investigating" | "resolved";

export interface Incident {
  id: string;
  title: string;
  severity: "SEV-1";
  status: IncidentStatus;
  service: string;
  startedAt: string;
  symptom: string;
}

export interface ServiceHealth {
  service: string;
  activeVersion: string;
  errorRatePct: number;
  p95LatencyMs: number;
  requestsPerMinute: number;
  region: string;
  sampledAt: string;
}

export interface Deployment {
  id: string;
  version: string;
  commit: string;
  deployedAt: string;
  author: string;
  change: string;
  active: boolean;
  rolledBackAt: string | null;
}

export type AuditKind =
  | "incident.opened"
  | "evidence.read"
  | "rollback.requested"
  | "rollback.completed"
  | "incident.resolved";

export interface AuditEvent {
  id: string;
  at: string;
  kind: AuditKind;
  actor: "simulator" | "trueforge-agent" | "human-approved";
  summary: string;
  detail?: string;
}

export interface Snapshot {
  incident: Incident;
  service: ServiceHealth;
  deployments: Deployment[];
  audit: AuditEvent[];
}

export interface RollbackInput {
  incidentId: string;
  deploymentId: string;
  evidence: string;
}

export interface RollbackResult {
  changed: boolean;
  previousVersion: string;
  activeVersion: string;
  incidentStatus: IncidentStatus;
  errorRatePct: number;
  message: string;
}

