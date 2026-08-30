import { readFile } from "node:fs/promises";

interface AgentConfig {
  name: string;
  manifest: {
    model: { name: string };
    [key: string]: unknown;
  };
}

const dryRun = process.argv.includes("--dry-run");
const baseUrl = process.env.TRUEFORGE_BASE_URL ?? "http://localhost:8790";
const model = process.env.TRUEFORGE_MODEL;
const raw = await readFile(new URL("../config/fuseops-agent.json", import.meta.url), "utf8");
const config = JSON.parse(raw) as AgentConfig;

if (!model) {
  console.error("Set TRUEFORGE_MODEL to the exact model FQN configured in TrueForge.");
  console.error("Example: TRUEFORGE_MODEL=openai/gpt-5-mini npm run agent:register");
  process.exitCode = 1;
} else {
  config.manifest.model.name = model;
  if (dryRun) {
    console.log(JSON.stringify(config, null, 2));
  } else {
    const response = await fetch(`${baseUrl}/api/v1/agents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(config),
    });
    if (response.status === 409) {
      console.error("Agent 'fuseops-commander' already exists. Update it in the TrueForge Agent Library or delete it before re-registering.");
      process.exitCode = 1;
    } else if (!response.ok) {
      console.error(`TrueForge returned ${response.status}: ${await response.text()}`);
      process.exitCode = 1;
    } else {
      const result = (await response.json()) as unknown;
      console.log("Registered fuseops-commander with TrueForge.");
      console.log(JSON.stringify(result, null, 2));
    }
  }
}

