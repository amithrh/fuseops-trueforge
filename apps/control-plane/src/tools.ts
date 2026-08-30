import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { IncidentStore } from "./incident-store.js";

const jsonResult = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

const errorResult = (error: unknown) => ({
  isError: true,
  content: [
    {
      type: "text" as const,
      text: error instanceof Error ? error.message : "Unknown control-plane error",
    },
  ],
});

export function createMcpServer(store: IncidentStore): McpServer {
  const server = new McpServer({ name: "fuseops-control-plane", version: "0.1.0" });

  server.registerTool(
    "get_incident",
    {
      title: "Get incident",
      description: "Read the owned incident record and alert context.",
      inputSchema: { incident_id: z.string().min(1) },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ incident_id }) => {
      try {
        return jsonResult(store.getIncident(incident_id));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_service_health",
    {
      title: "Get service health",
      description: "Read current error rate, latency, traffic, region, and active version.",
      inputSchema: { service: z.string().min(1) },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ service }) => {
      try {
        return jsonResult(store.getServiceHealth(service));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "list_recent_deployments",
    {
      title: "List recent deployments",
      description: "List recent deployments for an owned service, newest first.",
      inputSchema: { service: z.string().min(1) },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ service }) => {
      try {
        return jsonResult(store.listRecentDeployments(service));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "search_error_logs",
    {
      title: "Search error logs",
      description: "Search sanitized logs belonging to the demo incident.",
      inputSchema: { incident_id: z.string().min(1), query: z.string().min(1).max(200) },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ incident_id, query }) => {
      try {
        return jsonResult(store.searchErrorLogs(incident_id, query));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "get_runbook",
    {
      title: "Get incident runbook",
      description: "Read the approved incident-response procedure for the service.",
      inputSchema: { service: z.string().min(1) },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ service }) => {
      try {
        return jsonResult(store.getRunbook(service));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "rollback_deployment",
    {
      title: "Rollback deployment",
      description:
        "ROOT COMMANDER ONLY. Dynamic subagents must never call or request this tool. IRREVERSIBLE OPERATIONAL ACTION: roll back the currently active implicated deployment only after the root commander synthesizes all evidence and a human approves the exact arguments.",
      inputSchema: {
        incident_id: z.string().min(1),
        deployment_id: z.string().min(1),
        evidence: z.string().min(20).max(1000),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
    async ({ incident_id, deployment_id, evidence }) => {
      try {
        return jsonResult(
          await store.rollback({
            incidentId: incident_id,
            deploymentId: deployment_id,
            evidence,
          }),
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  return server;
}
