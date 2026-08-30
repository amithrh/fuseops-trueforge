import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it } from "vitest";
import { IncidentStore, incidentIds } from "./incident-store.js";
import { createMcpServer } from "./tools.js";

const open: Array<{ close(): Promise<void> }> = [];

afterEach(async () => {
  await Promise.all(open.splice(0).map((item) => item.close()));
});

async function connectedPair() {
  const store = new IncidentStore();
  const server = createMcpServer(store);
  const client = new Client({ name: "fuseops-contract-test", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  open.push(client, server);
  return { client, store };
}

describe("FuseOps MCP contract", () => {
  it("advertises five read-only tools and one destructive tool", async () => {
    const { client } = await connectedPair();
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(6);
    const rollback = tools.find((tool) => tool.name === "rollback_deployment");
    expect(rollback?.annotations?.destructiveHint).toBe(true);
    expect(rollback?.annotations?.readOnlyHint).toBe(false);
    expect(rollback?.description).toContain("ROOT COMMANDER ONLY");
    expect(rollback?.description).toContain("Dynamic subagents must never call");
    expect(
      tools.filter((tool) => tool.name !== "rollback_deployment").every((tool) => tool.annotations?.readOnlyHint),
    ).toBe(true);
  });

  it("reads incident evidence through the official client", async () => {
    const { client } = await connectedPair();
    const result = await client.callTool({
      name: "get_incident",
      arguments: { incident_id: incidentIds.incident },
    });
    expect(result.isError).not.toBe(true);
    expect(JSON.stringify(result.content)).toContain("Checkout payment failures");
  });

  it("executes the guarded rollback with exact validated arguments", async () => {
    const { client, store } = await connectedPair();
    const result = await client.callTool({
      name: "rollback_deployment",
      arguments: {
        incident_id: incidentIds.incident,
        deployment_id: incidentIds.badDeployment,
        evidence: "Deploy 4c21f0a preceded the error spike and correlated with failures at 0.90.",
      },
    });
    expect(result.isError).not.toBe(true);
    expect(store.snapshot().incident.status).toBe("resolved");
    expect(store.snapshot().service.activeVersion).toBe("checkout-v42");
  });

  it("returns an MCP error and preserves state for a wrong deployment", async () => {
    const { client, store } = await connectedPair();
    const before = store.snapshot();
    const result = await client.callTool({
      name: "rollback_deployment",
      arguments: {
        incident_id: incidentIds.incident,
        deployment_id: "deploy-checkout-v42",
        evidence: "This is intentionally the wrong target for a safety contract test.",
      },
    });
    expect(result.isError).toBe(true);
    expect(store.snapshot()).toEqual(before);
  });

  it("rejects overlong rollback evidence before any state change", async () => {
    const { client, store } = await connectedPair();
    const before = store.snapshot();
    const result = await client.callTool({
      name: "rollback_deployment",
      arguments: {
        incident_id: incidentIds.incident,
        deployment_id: incidentIds.badDeployment,
        evidence: "x".repeat(1001),
      },
    });

    expect(result.isError).toBe(true);
    expect(store.snapshot()).toEqual(before);
  });
});
