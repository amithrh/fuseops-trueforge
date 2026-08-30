import { describe, expect, it } from "vitest";
import { IncidentStore, incidentIds } from "./incident-store.js";

const validInput = {
  incidentId: incidentIds.incident,
  deploymentId: incidentIds.badDeployment,
  evidence: "Error rate rose from 1.1% to 18.4% within six minutes of deploy 4c21f0a.",
};

describe("IncidentStore", () => {
  it("starts with a consistent active incident", () => {
    const snapshot = new IncidentStore().snapshot();
    expect(snapshot.incident.status).toBe("investigating");
    expect(snapshot.service.activeVersion).toBe("checkout-v43");
    expect(snapshot.service.errorRatePct).toBe(18.4);
    expect(snapshot.deployments.filter((deployment) => deployment.active)).toHaveLength(1);
  });

  it("rejects a rollback without meaningful evidence and changes nothing", async () => {
    const store = new IncidentStore();
    const before = store.snapshot();
    await expect(store.rollback({ ...validInput, evidence: "probably deploy" })).rejects.toThrow(
      "at least 20 characters",
    );
    expect(store.snapshot()).toEqual(before);
  });

  it("rejects overlong rollback evidence at the domain boundary and changes nothing", async () => {
    const store = new IncidentStore();
    const before = store.snapshot();
    await expect(store.rollback({ ...validInput, evidence: "x".repeat(1001) })).rejects.toThrow(
      "must not exceed 1000 characters",
    );
    expect(store.snapshot()).toEqual(before);
  });

  it("normalizes rollback evidence before writing it to the audit trail", async () => {
    const store = new IncidentStore();
    await store.rollback({
      ...validInput,
      evidence: "  Error rate rose after deploy 4c21f0a.\n\tCorrelation score was 0.90.  ",
    });
    const requested = store.snapshot().audit.find((event) => event.kind === "rollback.requested");
    expect(requested?.detail).toBe(
      "Error rate rose after deploy 4c21f0a. Correlation score was 0.90.",
    );
  });

  it("rejects a rollback of an inactive deployment", async () => {
    const store = new IncidentStore();
    await expect(
      store.rollback({ ...validInput, deploymentId: "deploy-checkout-v42" }),
    ).rejects.toThrow("not the active rollback candidate");
    expect(store.snapshot().incident.status).toBe("investigating");
  });

  it("applies the approved rollback and records recovery", async () => {
    const store = new IncidentStore();
    const result = await store.rollback(validInput);
    const snapshot = store.snapshot();
    expect(result.changed).toBe(true);
    expect(snapshot.incident.status).toBe("resolved");
    expect(snapshot.service.activeVersion).toBe("checkout-v42");
    expect(snapshot.service.errorRatePct).toBe(1.2);
    expect(snapshot.audit.map((event) => event.kind)).toContain("rollback.completed");
    expect(snapshot.audit.map((event) => event.kind)).toContain("incident.resolved");
  });

  it("returns an unchanged result for an exact sequential retry", async () => {
    const store = new IncidentStore();
    const first = await store.rollback(validInput);
    const afterFirst = store.snapshot();
    const second = await store.rollback(validInput);

    expect(first.changed).toBe(true);
    expect(second.changed).toBe(false);
    expect(second.previousVersion).toBe("checkout-v43");
    expect(store.snapshot()).toEqual(afterFirst);
  });

  it("fails closed without partial mutation when the rollback target is missing", async () => {
    const store = new IncidentStore();
    const internals = store as unknown as { deployments: Array<{ id: string }> };
    internals.deployments = internals.deployments.filter(
      (deployment) => deployment.id !== "deploy-checkout-v42",
    );
    const before = store.snapshot();

    await expect(store.rollback(validInput)).rejects.toThrow("rollback target is missing");
    expect(store.snapshot()).toEqual(before);
  });

  it("rejects inconsistent deployment and service state without mutation", async () => {
    const store = new IncidentStore();
    const internals = store as unknown as { service: { activeVersion: string } };
    internals.service.activeVersion = "checkout-v42";
    const before = store.snapshot();

    await expect(store.rollback(validInput)).rejects.toThrow(
      "deployment and service state are inconsistent",
    );
    expect(store.snapshot()).toEqual(before);
  });

  it("serializes simultaneous rollback calls and applies exactly one mutation", async () => {
    const store = new IncidentStore();
    const [first, second] = await Promise.all([
      store.rollback(validInput),
      store.rollback(validInput),
    ]);
    const snapshot = store.snapshot();

    expect([first.changed, second.changed].sort()).toEqual([false, true]);
    expect(snapshot.incident.status).toBe("resolved");
    expect(snapshot.service.activeVersion).toBe("checkout-v42");
    expect(snapshot.audit.filter((event) => event.kind === "rollback.completed")).toHaveLength(1);
  });
});
