import { randomUUID } from "node:crypto";
import type {
  AuditEvent,
  Deployment,
  Incident,
  RollbackInput,
  RollbackResult,
  ServiceHealth,
  Snapshot,
} from "./types.js";

const INCIDENT_ID = "inc-checkout-2026-08-30";
const BAD_DEPLOYMENT_ID = "deploy-checkout-v43";

const clone = <T>(value: T): T => structuredClone(value);

export class IncidentStore {
  private incident!: Incident;
  private service!: ServiceHealth;
  private deployments!: Deployment[];
  private audit!: AuditEvent[];
  private mutation: Promise<void> = Promise.resolve();

  constructor() {
    this.reset();
  }

  reset(): Snapshot {
    const startedAt = "2026-08-30T11:04:00.000Z";
    this.incident = {
      id: INCIDENT_ID,
      title: "Checkout payment failures above SLO",
      severity: "SEV-1",
      status: "investigating",
      service: "checkout-api",
      startedAt,
      symptom: "Payment authorization failures increased immediately after checkout-v43 reached production.",
    };
    this.service = {
      service: "checkout-api",
      activeVersion: "checkout-v43",
      errorRatePct: 18.4,
      p95LatencyMs: 2140,
      requestsPerMinute: 8420,
      region: "us-west-2",
      sampledAt: "2026-08-30T11:12:00.000Z",
    };
    this.deployments = [
      {
        id: BAD_DEPLOYMENT_ID,
        version: "checkout-v43",
        commit: "4c21f0a",
        deployedAt: "2026-08-30T10:58:00.000Z",
        author: "release-bot",
        change: "Retry payment authorization on ambiguous gateway timeouts",
        active: true,
        rolledBackAt: null,
      },
      {
        id: "deploy-checkout-v42",
        version: "checkout-v42",
        commit: "ae091d3",
        deployedAt: "2026-08-29T15:20:00.000Z",
        author: "release-bot",
        change: "Add payment gateway request tracing",
        active: false,
        rolledBackAt: null,
      },
    ];
    this.audit = [
      {
        id: randomUUID(),
        at: startedAt,
        kind: "incident.opened",
        actor: "simulator",
        summary: "SEV-1 opened for checkout payment failures",
        detail: "Error rate crossed 15% for five minutes.",
      },
    ];
    return this.snapshot();
  }

  snapshot(): Snapshot {
    return clone({
      incident: this.incident,
      service: this.service,
      deployments: this.deployments,
      audit: this.audit,
    });
  }

  getIncident(incidentId: string): Incident {
    this.assertIncident(incidentId);
    this.recordEvidence("Incident record and alert context read");
    return clone(this.incident);
  }

  getServiceHealth(service: string): ServiceHealth {
    if (service !== this.service.service) {
      throw new Error(`Unknown service: ${service}`);
    }
    this.recordEvidence(`Live health sampled for ${service}`);
    return clone(this.service);
  }

  listRecentDeployments(service: string): Deployment[] {
    if (service !== this.service.service) {
      throw new Error(`Unknown service: ${service}`);
    }
    this.recordEvidence(`Recent deployments read for ${service}`);
    return clone(this.deployments);
  }

  searchErrorLogs(incidentId: string, query: string): string[] {
    this.assertIncident(incidentId);
    this.recordEvidence(`Error logs searched: ${query}`);
    return [
      "11:04:12 checkout-api payment.authorize retry=2 gateway=stripe reason=ambiguous_timeout duration_ms=2108",
      "11:04:13 checkout-api payment.authorize duplicate_request key=pay_7fa original_status=approved",
      "11:05:02 checkout-api circuit_breaker state=open dependency=payment-gateway failure_rate=0.184",
      "11:06:41 checkout-api trace deploy=4c21f0a retry_branch=ambiguous_timeout outcome=duplicate_authorization",
    ];
  }

  getRunbook(service: string): string {
    if (service !== this.service.service) {
      throw new Error(`Unknown service: ${service}`);
    }
    this.recordEvidence(`Rollback runbook read for ${service}`);
    return [
      "Checkout SEV-1 runbook:",
      "1. Confirm the error-rate change aligns with a recent deployment.",
      "2. Exclude payment-provider and database incidents.",
      "3. Run a correlation calculation against the deploy window.",
      "4. Rollback requires human approval and a written evidence summary.",
      "5. Verify error rate returns below 2% after rollback.",
    ].join("\n");
  }

  async rollback(input: RollbackInput): Promise<RollbackResult> {
    let result!: RollbackResult;
    let release!: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previous = this.mutation;
    this.mutation = next;
    await previous;

    try {
      result = this.applyRollback(input);
    } finally {
      release();
    }
    return result;
  }

  private applyRollback(input: RollbackInput): RollbackResult {
    this.assertIncident(input.incidentId);
    if (input.evidence.trim().length < 20) {
      throw new Error("Rollback evidence must explain the observed cause in at least 20 characters.");
    }
    const deployment = this.deployments.find((item) => item.id === input.deploymentId);
    if (!deployment) {
      throw new Error(`Unknown deployment: ${input.deploymentId}`);
    }

    if (this.incident.status === "resolved" && !deployment.active) {
      return {
        changed: false,
        previousVersion: "checkout-v43",
        activeVersion: this.service.activeVersion,
        incidentStatus: this.incident.status,
        errorRatePct: this.service.errorRatePct,
        message: "Rollback was already completed; no additional state changed.",
      };
    }
    if (!deployment.active || deployment.id !== BAD_DEPLOYMENT_ID) {
      throw new Error(`Deployment ${input.deploymentId} is not the active rollback candidate.`);
    }

    const completedAt = new Date().toISOString();
    this.audit.push({
      id: randomUUID(),
      at: completedAt,
      kind: "rollback.requested",
      actor: "trueforge-agent",
      summary: `Rollback requested for ${deployment.version}`,
      detail: input.evidence,
    });

    deployment.active = false;
    deployment.rolledBackAt = completedAt;
    const previousVersion = deployment.version;
    const target = this.deployments.find((item) => item.id === "deploy-checkout-v42");
    if (!target) throw new Error("Seed invariant failed: rollback target is missing.");
    target.active = true;
    this.service = {
      ...this.service,
      activeVersion: target.version,
      errorRatePct: 1.2,
      p95LatencyMs: 312,
      sampledAt: completedAt,
    };
    this.incident = { ...this.incident, status: "resolved" };
    this.audit.push(
      {
        id: randomUUID(),
        at: completedAt,
        kind: "rollback.completed",
        actor: "human-approved",
        summary: `${previousVersion} rolled back to ${target.version}`,
        detail: "State change executed only after the TrueForge approval checkpoint.",
      },
      {
        id: randomUUID(),
        at: completedAt,
        kind: "incident.resolved",
        actor: "simulator",
        summary: "Checkout error rate recovered to 1.2%",
        detail: "Service is back within the 2% error-rate SLO.",
      },
    );

    return {
      changed: true,
      previousVersion,
      activeVersion: target.version,
      incidentStatus: this.incident.status,
      errorRatePct: this.service.errorRatePct,
      message: "Approved rollback completed and checkout health recovered.",
    };
  }

  private assertIncident(incidentId: string): void {
    if (incidentId !== this.incident.id) {
      throw new Error(`Unknown incident: ${incidentId}`);
    }
  }

  private recordEvidence(summary: string): void {
    this.audit.push({
      id: randomUUID(),
      at: new Date().toISOString(),
      kind: "evidence.read",
      actor: "trueforge-agent",
      summary,
    });
  }
}

export const incidentIds = {
  incident: INCIDENT_ID,
  badDeployment: BAD_DEPLOYMENT_ID,
} as const;

