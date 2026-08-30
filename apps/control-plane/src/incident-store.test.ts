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
