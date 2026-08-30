import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  Box,
  Braces,
  ChevronRight,
  Clock3,
  Gauge,
  GitBranch,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wifi,
  WifiOff,
} from "lucide-react";
import { MetricCard } from "./components/MetricCard";
import { Timeline } from "./components/Timeline";
import { initialReplay, recoverReplay, replaySteps } from "./replay";
import type { RunMode, Snapshot } from "./types";

const controlPlaneUrl = import.meta.env.VITE_CONTROL_PLANE_URL ?? "http://localhost:3100";
const trueForgeUrl = import.meta.env.VITE_TRUEFORGE_URL ?? "/trueforge";
const trueForgeEmbedUrl = import.meta.env.VITE_TRUEFORGE_EMBED_URL ?? "http://localhost:8790";

const prompt =
  "Investigate incident inc-checkout-2026-08-30. Gather evidence from every relevant control-plane tool, delegate at least two competing hypotheses, and write a small correlation script in the sandbox. If a deploy caused the regression, propose the safest remediation with your evidence. Do not execute any rollback until I approve the exact tool call.";

export default function App() {
  const [mode, setMode] = useState<RunMode>("replay");
  const [snapshot, setSnapshot] = useState<Snapshot>(initialReplay);
  const [connected, setConnected] = useState(false);
  const [harnessReady, setHarnessReady] = useState(false);
  const [harnessChecking, setHarnessChecking] = useState(false);
  const [replayRunning, setReplayRunning] = useState(false);
  const [approvalWaiting, setApprovalWaiting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (mode !== "live") return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`${controlPlaneUrl}/api/snapshot`);
        if (!response.ok) throw new Error("Control plane unavailable");
        const value = (await response.json()) as Snapshot;
        if (active) {
          setSnapshot(value);
          setConnected(true);
        }
      } catch {
        if (active) setConnected(false);
      }
    };
    void load();
    const timer = window.setInterval(load, 1500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "live") return;
    let active = true;
    setHarnessChecking(true);
    fetch(`${trueForgeUrl}/api/v1/capabilities`)
      .then((response) => {
        if (!response.ok) throw new Error("TrueForge unavailable");
        if (active) setHarnessReady(true);
      })
      .catch(() => {
        if (active) setHarnessReady(false);
      })
      .finally(() => {
        if (active) setHarnessChecking(false);
      });
    return () => {
      active = false;
    };
  }, [mode]);

  const activeDeploy = useMemo(
    () => snapshot.deployments.find((deployment) => deployment.active),
    [snapshot.deployments],
  );
  const resolved = snapshot.incident.status === "resolved";

  const startReplay = async () => {
    setSnapshot(structuredClone(initialReplay));
    setApprovalWaiting(false);
    setReplayRunning(true);
    for (const [index, step] of replaySteps.entries()) {
      await new Promise((resolve) => window.setTimeout(resolve, index === 0 ? 350 : 620));
      setSnapshot((current) => ({
        ...current,
        audit: [
          ...current.audit,
          {
            id: `replay-${index}`,
            at: new Date(Date.now() + index * 1000).toISOString(),
            ...step,
          },
        ],
      }));
    }
    setReplayRunning(false);
    setApprovalWaiting(true);
  };

  const approveReplay = () => {
    setSnapshot((current) => recoverReplay(current));
    setApprovalWaiting(false);
  };

  const resetLive = async () => {
    const response = await fetch(`${controlPlaneUrl}/api/reset`, { method: "POST" });
    if (response.ok) setSnapshot((await response.json()) as Snapshot);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className={`app-shell ${resolved ? "app-shell--resolved" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="FuseOps home">
          <span className="brand__mark"><ShieldCheck size={19} /></span>
          <span><strong>FuseOps</strong><small>Incident command</small></span>
        </a>
        <div className="mode-switch" role="group" aria-label="Run mode">
          <button className={mode === "live" ? "is-active" : ""} onClick={() => setMode("live")}>Live harness</button>
          <button className={mode === "replay" ? "is-active" : ""} onClick={() => { setMode("replay"); setSnapshot(initialReplay); }}>Demo replay</button>
        </div>
        <div className={`connection ${mode === "replay" || connected ? "is-online" : ""}`}>
          {mode === "replay" || connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{mode === "replay" ? "Credential-free replay" : connected ? "Control plane linked" : "Control plane offline"}</span>
        </div>
      </header>

      <section className="incident-hero" id="top">
        <div>
          <div className="incident-hero__kicker">
            <span className={resolved ? "status status--safe" : "status status--danger"}>{resolved ? "Resolved" : "SEV-1 active"}</span>
            <span>INC-0731</span>
            <span><Clock3 size={13} /> Opened 11:04 UTC</span>
          </div>
          <h1>{resolved ? "Checkout recovered." : "Payments are failing."}</h1>
          <p>{resolved ? "The approved rollback restored the service to its error budget." : "FuseOps is correlating the alert with code, deploy, and dependency evidence before it asks to act."}</p>
        </div>
        <div className="hero-actions">
          {mode === "replay" ? (
            <button className="button button--primary" onClick={startReplay} disabled={replayRunning || approvalWaiting}>
              <Play size={16} fill="currentColor" /> {replayRunning ? "Investigation running" : resolved ? "Replay again" : "Run investigation"}
            </button>
          ) : (
            <button className="button button--quiet" onClick={resetLive}><RotateCcw size={16} /> Reset scenario</button>
          )}
          <button className="button button--quiet" onClick={copyPrompt}><Braces size={16} /> {copied ? "Prompt copied" : "Copy demo prompt"}</button>
        </div>
      </section>

      <section className="metric-grid" aria-label="Live service health">
        <MetricCard eyebrow="Error rate" value={`${snapshot.service.errorRatePct.toFixed(1)}%`} note={resolved ? "Within 2% SLO" : "+17.3 points after deploy"} tone={resolved ? "safe" : "danger"} icon={<Activity size={18} />} />
        <MetricCard eyebrow="p95 latency" value={`${snapshot.service.p95LatencyMs.toLocaleString()} ms`} note={resolved ? "Baseline restored" : "6.8× baseline"} tone={resolved ? "safe" : "danger"} icon={<Gauge size={18} />} />
        <MetricCard eyebrow="Active release" value={snapshot.service.activeVersion.replace("checkout-", "")} note={`${activeDeploy?.commit ?? "unknown"} · ${snapshot.service.region}`} tone={resolved ? "safe" : "neutral"} icon={<GitBranch size={18} />} />
        <MetricCard eyebrow="Traffic protected" value={`${(snapshot.service.requestsPerMinute / 1000).toFixed(1)}k/min`} note="No synthetic customer data" icon={<ShieldCheck size={18} />} />
      </section>

      <section className="workspace">
        <div className="evidence-pane">
          <div className="panel-heading">
            <div><span>Evidence recorder</span><h2>What the agent did</h2></div>
            <span className="event-count">{snapshot.audit.length} events</span>
          </div>
          <div className="system-path" aria-label="System path">
            <div><RadioNode icon={<Sparkles size={16} />} label="TrueForge" meta="agent loop" /></div>
            <ChevronRight size={15} />
            <div><RadioNode icon={<Box size={16} />} label="MCP" meta="real tools" /></div>
            <ChevronRight size={15} />
            <div><RadioNode icon={<TerminalSquare size={16} />} label="Sandbox" meta="isolated proof" /></div>
            <ChevronRight size={15} />
            <div><RadioNode icon={<ShieldCheck size={16} />} label="Human" meta="final authority" /></div>
          </div>
          <Timeline events={snapshot.audit} />
        </div>

        <aside className="agent-pane">
          <div className="panel-heading panel-heading--agent">
            <div><span>{mode === "live" ? "Live TrueForge session" : "Harness preview"}</span><h2>FuseOps commander</h2></div>
            <span className="harness-badge"><span /> harness central</span>
          </div>
          {mode === "live" ? (
            <div className="trueforge-frame">
              {harnessReady ? (
                <iframe
                  src={`${trueForgeEmbedUrl}/`}
                  title="Live TrueForge agent session"
                  loading="eager"
                  allow="clipboard-read; clipboard-write"
                />
              ) : (
                <div className="harness-offline" role="status">
                  {harnessChecking ? <span className="harness-spinner" /> : <WifiOff size={22} />}
                  <h3>{harnessChecking ? "Looking for TrueForge…" : "TrueForge is offline"}</h3>
                  <p>Start the local harness at <code>localhost:8790</code>, configure the model, sandbox, and FuseOps MCP connector, then reload.</p>
                  <code>npx @truefoundry/trueforge@latest</code>
                  <button className="button button--quiet" onClick={() => setMode("replay")}><Play size={15} /> Use credential-free replay</button>
                </div>
              )}
            </div>
          ) : (
            <div className="replay-agent">
              <div className="replay-notice"><Sparkles size={15} /> Product replay — no model is running</div>
              <div className="prompt-card">
                <span>Operator</span>
                <p>Investigate the checkout incident. Prove the cause, then propose the safest remediation.</p>
              </div>
              <div className="agent-response">
                <span className="agent-avatar"><ShieldCheck size={16} /></span>
                <div>
                  <strong>FuseOps</strong>
                  <p>{resolved ? "Rollback completed after approval. Error rate is back to 1.2%, and checkout-v42 is active." : approvalWaiting ? "Evidence converges on deploy 4c21f0a. I am holding the rollback until you approve the exact action." : replayRunning ? "Investigating across metrics, deploy history, logs, and isolated analysis…" : "I’ll investigate with read-only tools first. I won’t change service state without your approval."}</p>
                </div>
              </div>
              {approvalWaiting ? (
                <div className="approval-card">
                  <div className="approval-card__title"><ShieldCheck size={18} /><div><span>Human checkpoint</span><strong>Allow rollback_deployment?</strong></div></div>
                  <dl><div><dt>Deployment</dt><dd>checkout-v43 · 4c21f0a</dd></div><div><dt>Target</dt><dd>checkout-v42</dd></div><div><dt>Reason</dt><dd>0.94 deploy/error correlation</dd></div></dl>
                  <p>Replay control only. In live mode, TrueForge owns this checkpoint and the tool cannot run before Allow.</p>
                  <div className="approval-card__actions"><button className="button button--quiet" onClick={() => setApprovalWaiting(false)}>Deny</button><button className="button button--approve" onClick={approveReplay}><ShieldCheck size={15} /> Allow rollback</button></div>
                </div>
              ) : null}
              <div className="capability-row">
                <span><Box size={14} /> 6 MCP tools</span><span><TerminalSquare size={14} /> sandbox</span><span><GitBranch size={14} /> subagents</span>
              </div>
            </div>
          )}
        </aside>
      </section>

      <footer className="footer">
        <span><ShieldCheck size={15} /> Built on TrueForge. Every state change waits for a person.</span>
        <span>Owned simulator · no customer data · open source</span>
      </footer>
    </main>
  );
}

function RadioNode({ icon, label, meta }: { icon: React.ReactNode; label: string; meta: string }) {
  return <><span className="system-path__icon">{icon}</span><span><strong>{label}</strong><small>{meta}</small></span></>;
}
