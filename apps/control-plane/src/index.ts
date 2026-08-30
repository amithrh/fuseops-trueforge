import cors from "cors";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { IncidentStore } from "./incident-store.js";
import { createMcpServer } from "./tools.js";

const port = Number(process.env.PORT ?? 3100);
const app = express();
const store = new IncidentStore();

app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    methods: ["GET", "POST", "OPTIONS"],
    exposedHeaders: ["mcp-session-id"],
  }),
);
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "fuseops-control-plane" });
});

app.get("/api/snapshot", (_request, response) => {
  response.json(store.snapshot());
});

app.post("/api/reset", (_request, response) => {
  response.json(store.reset());
});

app.post("/mcp", async (request, response) => {
  const server = createMcpServer(store);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  response.on("close", () => {
    void transport.close();
    void server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(request, response, request.body);
});

app.get("/mcp", (_request, response) => {
  response.status(405).json({ error: "Use POST for stateless Streamable HTTP MCP requests." });
});

app.delete("/mcp", (_request, response) => {
  response.status(405).json({ error: "Stateless transport has no session to delete." });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  response.status(500).json({ error: message });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`FuseOps control plane ready at http://127.0.0.1:${port}`);
  console.log(`MCP endpoint: http://127.0.0.1:${port}/mcp`);
});

