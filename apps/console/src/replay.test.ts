import { describe, expect, it } from "vitest";
import { initialReplay, recoverReplay, replaySteps } from "./replay";

describe("demo replay", () => {
  it("labels an approval boundary before recovery", () => {
    expect(replaySteps.at(-1)?.kind).toBe("approval.waiting");
    expect(initialReplay.incident.status).toBe("investigating");
    expect(initialReplay.service.errorRatePct).toBeGreaterThan(15);
  });

  it("shows recovery only after the explicit replay approval", () => {
    const recovered = recoverReplay(structuredClone(initialReplay));
    expect(recovered.incident.status).toBe("resolved");
    expect(recovered.service.activeVersion).toBe("checkout-v42");
    expect(recovered.service.errorRatePct).toBeLessThan(2);
    expect(recovered.audit.map((event) => event.kind)).toEqual(
      expect.arrayContaining(["rollback.completed", "incident.resolved"]),
    );
  });

  it("does not mutate the source fixture", () => {
    recoverReplay(initialReplay);
    expect(initialReplay.incident.status).toBe("investigating");
    expect(initialReplay.deployments.find((deployment) => deployment.active)?.version).toBe(
      "checkout-v43",
    );
  });
});

