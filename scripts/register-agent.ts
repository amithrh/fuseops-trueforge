import { readFile } from "node:fs/promises";

interface AgentConfig {
  name: string;
  manifest: {
    model: { name: string };
    [key: string]: unknown;
  };
}

interface AgentRecord extends AgentConfig {
  id: string;
}

interface ListAgentsResponse {
  data: AgentRecord[];
}

const dryRun = process.argv.includes("--dry-run");
const baseUrl = (process.env.TRUEFORGE_BASE_URL ?? "http://localhost:8790").replace(/\/$/, "");
const agentsUrl = `${baseUrl}/api/v1/agents`;
const model = process.env.TRUEFORGE_MODEL;
const raw = await readFile(new URL("../config/fuseops-agent.json", import.meta.url), "utf8");
const config = JSON.parse(raw) as AgentConfig;

async function responseError(response: Response): Promise<string> {
  const detail = await response.text();
  return `TrueForge returned ${response.status}${detail ? `: ${detail}` : ""}`;
}

async function findAgentByName(name: string): Promise<AgentRecord | undefined> {
  const response = await fetch(agentsUrl);
  if (!response.ok) throw new Error(await responseError(response));
  const result = (await response.json()) as ListAgentsResponse;
  if (!Array.isArray(result.data)) {
    throw new Error("TrueForge returned an invalid agents list.");
  }
  return result.data.find((agent) => agent.name === name);
}

async function saveAgent(existing?: AgentRecord): Promise<{ action: "registered" | "updated"; result: unknown }> {
  const response = await fetch(existing ? `${agentsUrl}/${encodeURIComponent(existing.id)}` : agentsUrl, {
    method: existing ? "PUT" : "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(existing ? { manifest: config.manifest } : config),
  });

  // A concurrent first-time setup may create the named agent between list and create.
  if (!existing && response.status === 409) {
    const racedAgent = await findAgentByName(config.name);
    if (racedAgent) return saveAgent(racedAgent);
  }
  if (!response.ok) throw new Error(await responseError(response));
  return {
    action: existing ? "updated" : "registered",
    result: (await response.json()) as unknown,
  };
}

if (!model) {
  console.error("Set TRUEFORGE_MODEL to the exact model FQN configured in TrueForge.");
  console.error("Example: TRUEFORGE_MODEL=openai/gpt-5-mini npm run agent:register");
  process.exitCode = 1;
} else {
  config.manifest.model.name = model;
  if (dryRun) {
    console.log(JSON.stringify(config, null, 2));
  } else {
    try {
      const saved = await saveAgent(await findAgentByName(config.name));
      console.log(`${saved.action === "registered" ? "Registered" : "Updated"} ${config.name} with TrueForge.`);
      console.log(JSON.stringify(saved.result, null, 2));
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  }
}
