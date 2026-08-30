import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
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
  "Investigate incident inc-checkout-2026-08-30 for service checkout-api using the prescribed FuseOps workflow. Use only identifiers returned by tools. Give both subagents the concrete incident, service, deployment, timestamps, health, and log evidence. Start each delegated input with the required evidence-review-only rule: subagents may use read-only tools but must never call rollback_deployment or request remediation. Run the correlation in the TrueForge sandbox exactly once with an empty cwd and one inline standard-library Python command; do not create files or use mock data. If the evidence converges on a deploy regression, the root commander may propose the safest remediation. Do not execute any rollback until I approve the exact tool call.";

type ControlPlaneState = "idle" | "connecting" | "online" | "stale";
type HarnessState = "idle" | "checking" | "reachable" | "offline";

export default function App() {
  const [mode, setMode] = useState<RunMode>("replay");
  const [snapshot, setSnapshot] = useState<Snapshot>(initialReplay);
  const [controlPlaneState, setControlPlaneState] = useState<ControlPlaneState>("idle");
  const [hasLiveSnapshot, setHasLiveSnapshot] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [harnessState, setHarnessState] = useState<HarnessState>("idle");
  const [replayRunning, setReplayRunning] = useState(false);
  const [approvalWaiting, setApprovalWaiting] = useState(false);
  const [copied, setCopied] = useState(false);
  const modeRef = useRef<RunMode>(mode);
  const replayRunRef = useRef(0);
  const resetRunRef = useRef(0);
  const replayButtonRef = useRef<HTMLButtonElement>(null);
  const approvalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "live") return;
    let active = true;
    let inFlight = false;
    const controller = new AbortController();
    setControlPlaneState("connecting");
    setHasLiveSnapshot(false);
    setResetError(null);
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch(`${controlPlaneUrl}/api/snapshot`, { signal: controller.signal });
        if (!response.ok) throw new Error("Control plane unavailable");
        const value = (await response.json()) as Snapshot;
        if (active) {
          setSnapshot(value);
          setHasLiveSnapshot(true);
          setControlPlaneState("online");
        }
      } catch {
        if (active) setControlPlaneState("stale");
      } finally {
        inFlight = false;
      }
    };
    void load();
    const timer = window.setInterval(load, 1500);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "live") return;
    let active = true;
    const controller = new AbortController();
    setHarnessState("checking");
    fetch(`${trueForgeUrl}/api/v1/capabilities`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("TrueForge unavailable");
        if (active) setHarnessState("reachable");
      })
      .catch(() => {
        if (active) setHarnessState("offline");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [mode]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (approvalWaiting && mode === "replay") approvalRef.current?.focus();
  }, [approvalWaiting, mode]);

  useEffect(
    () => () => {
      replayRunRef.current += 1;
      resetRunRef.current += 1;
    },
    [],
  );

  const activeDeploy = useMemo(
    () => snapshot.deployments.find((deployment) => deployment.active),
    [snapshot.deployments],
  );
  const resolved = snapshot.incident.status === "resolved";
  const connected = controlPlaneState === "online";
  const snapshotStale = mode === "live" && !connected;
  const replayStepCount = snapshot.audit.filter((event) => event.id.startsWith("replay-")).length;
  const harnessLabel = mode === "replay"
    ? "Replay ready"
    : harnessState === "checking"
      ? "Checking TrueForge"
      : harnessState === "reachable"
        ? "TrueForge reachable"
        : "TrueForge offline";

  const selectMode = (nextMode: RunMode) => {
    if (nextMode === modeRef.current) return;
    replayRunRef.current += 1;
    resetRunRef.current += 1;
    modeRef.current = nextMode;
    setReplayRunning(false);
    setApprovalWaiting(false);
    setResetting(false);
    setResetError(null);
    setMode(nextMode);
    if (nextMode === "live") {
      setControlPlaneState("connecting");
      setHasLiveSnapshot(false);
      setHarnessState("checking");
    }
    if (nextMode === "replay") {
      setSnapshot(structuredClone(initialReplay));
      setControlPlaneState("idle");
      setHasLiveSnapshot(false);
      setHarnessState("idle");
    }
  };

  const startReplay = async () => {
    const runId = replayRunRef.current + 1;
    replayRunRef.current = runId;
    setSnapshot(structuredClone(initialReplay));
    setApprovalWaiting(false);
    setReplayRunning(true);
    for (const [index, step] of replaySteps.entries()) {
      await new Promise((resolve) => window.setTimeout(resolve, index === 0 ? 350 : 620));
      if (replayRunRef.current !== runId || modeRef.current !== "replay") return;
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
    if (replayRunRef.current !== runId || modeRef.current !== "replay") return;
    setReplayRunning(false);
    setApprovalWaiting(true);
  };

  const approveReplay = () => {
    setSnapshot((current) => recoverReplay(current));
    setApprovalWaiting(false);
    window.setTimeout(() => replayButtonRef.current?.focus(), 0);
  };

  const denyReplay = () => {
    setApprovalWaiting(false);
    window.setTimeout(() => replayButtonRef.current?.focus(), 0);
  };

  const resetLive = async () => {
    const resetId = resetRunRef.current + 1;
    resetRunRef.current = resetId;
    setResetting(true);
    setResetError(null);
    try {
      const response = await fetch(`${controlPlaneUrl}/api/reset`, { method: "POST" });
      if (!response.ok) throw new Error("Reset request failed");
      const value = (await response.json()) as Snapshot;
      if (modeRef.current !== "live" || resetRunRef.current !== resetId) return;
      setSnapshot(value);
      setHasLiveSnapshot(true);
      setControlPlaneState("online");
    } catch {
      if (modeRef.current === "live" && resetRunRef.current === resetId) {
        setResetError("Scenario reset failed. No changes were applied; retry when the control plane is linked.");
      }
    } finally {
      if (modeRef.current === "live" && resetRunRef.current === resetId) setResetting(false);
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className={`app-shell ${resolved ? "app-shell--resolved" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="FuseOps home">
          <span className="brand__mark"><ShieldCheck size={19} /></span>
          <span><strong>FuseOps</strong><small>Incident command</small></span>
        </a>
        <div className="mode-switch" role="group" aria-label="Run mode">
          <button type="button" aria-pressed={mode === "live"} className={mode === "live" ? "is-active" : ""} onClick={() => selectMode("live")}>Live harness</button>
          <button type="button" aria-pressed={mode === "replay"} className={mode === "replay" ? "is-active" : ""} onClick={() => selectMode("replay")}>Demo replay</button>
        </div>
        <div className={`connection ${mode === "replay" || connected ? "is-online" : ""}`} role="status" aria-live="polite">
          {mode === "replay" || connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{mode === "replay" ? "Credential-free replay" : connected ? "Control plane linked" : controlPlaneState === "connecting" ? "Control plane connecting" : "Control plane data stale"}</span>
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
            <button ref={replayButtonRef} type="button" className="button button--primary" onClick={startReplay} disabled={replayRunning || approvalWaiting} aria-busy={replayRunning} aria-describedby="replay-progress">
              <Play size={16} fill="currentColor" /> {replayRunning ? "Investigation running" : resolved ? "Replay again" : "Run investigation"}
            </button>
          ) : (
            <button type="button" className="button button--quiet" onClick={resetLive} disabled={resetting} aria-busy={resetting}><RotateCcw size={16} /> {resetting ? "Resetting scenario…" : "Reset scenario"}</button>
          )}
          <button type="button" className="button button--quiet" onClick={copyPrompt}><Braces size={16} /> {copied ? "Prompt copied" : "Copy demo prompt"}</button>
        </div>
      </section>

      {mode === "live" && (snapshotStale || resetError) ? (
        <div className={`runtime-alert ${resetError || controlPlaneState === "stale" ? "runtime-alert--error" : ""}`} role={resetError || controlPlaneState === "stale" ? "alert" : "status"} aria-live="polite">
          <WifiOff size={16} />
          <span>
            <strong>{resetError ?? (controlPlaneState === "connecting" ? "Connecting to the control plane…" : "Live snapshot unavailable.")}</strong>
            <small>{hasLiveSnapshot ? "Showing the last verified live snapshot while automatic retry continues." : "Metrics remain marked as demo data until a live snapshot is verified."}</small>
          </span>
        </div>
      ) : null}

      <section className={`metric-grid ${snapshotStale ? "metric-grid--stale" : ""}`} aria-label={snapshotStale ? "Service health — unverified demo snapshot" : "Live service health"} aria-busy={mode === "live" && controlPlaneState === "connecting"}>
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
            <span className={`harness-badge harness-badge--${mode === "replay" ? "ready" : harnessState}`} role="status" aria-live="polite"><span /> {harnessLabel}</span>
          </div>
          {mode === "live" ? (
            <div className="trueforge-frame">
              {harnessState === "reachable" ? (
                <>
                  <div className="harness-preflight" role="note">
                    <ShieldCheck size={16} />
                    <span><strong>TrueForge service reached</strong><small>Select FuseOps Commander and confirm 6 MCP tools before sending the demo prompt.</small></span>
                  </div>
                  <iframe
                    src={`${trueForgeEmbedUrl}/`}
                    title="Live TrueForge agent session"
                    loading="eager"
                    allow="clipboard-read; clipboard-write"
                  />
                </>
              ) : (
                <div className="harness-offline" role="status">
                  {harnessState === "checking" ? <span className="harness-spinner" /> : <WifiOff size={22} />}
                  <h3>{harnessState === "checking" ? "Looking for TrueForge…" : "TrueForge is offline"}</h3>
                  <p>Start the local harness at <code>localhost:8790</code>, configure the model, sandbox, and FuseOps MCP connector, then reload.</p>
                  <code>npx @truefoundry/trueforge@0.1.4</code>
                  <button type="button" className="button button--quiet" onClick={() => selectMode("replay")}><Play size={15} /> Use credential-free replay</button>
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
              <div className="agent-response" aria-live="polite" aria-atomic="true">
                <span className="agent-avatar"><ShieldCheck size={16} /></span>
                <div>
                  <strong>FuseOps</strong>
                  <p>{resolved ? "Rollback completed after approval. Error rate is back to 1.2%, and checkout-v42 is active." : approvalWaiting ? "Evidence converges on deploy 4c21f0a. I am holding the rollback until you approve the exact action." : replayRunning ? "Investigating across metrics, deploy history, logs, and isolated analysis…" : "I’ll investigate with read-only tools first. I won’t change service state without your approval."}</p>
                </div>
              </div>
              <p className="sr-only" id="replay-progress" role="status" aria-live="polite" aria-atomic="true">
                {replayRunning
                  ? `Investigation in progress. ${replayStepCount} of ${replaySteps.length} evidence steps complete.`
                  : approvalWaiting
                    ? "Investigation complete. Human approval is required before rollback."
                    : resolved
                      ? "Rollback approved. Checkout recovered."
                      : "Investigation ready to run."}
              </p>
              {approvalWaiting ? (
                <div ref={approvalRef} className="approval-card" role="region" aria-labelledby="approval-title" aria-describedby="approval-description" aria-live="assertive" tabIndex={-1}>
                  <div className="approval-card__title"><ShieldCheck size={18} /><div><span>Human checkpoint</span><strong id="approval-title">Allow rollback_deployment?</strong></div></div>
                  <dl><div><dt>Deployment</dt><dd>checkout-v43 · 4c21f0a</dd></div><div><dt>Target</dt><dd>checkout-v42</dd></div><div><dt>Reason</dt><dd>0.90 deploy/error correlation</dd></div></dl>
                  <p id="approval-description">Replay control only. In live mode, TrueForge owns this checkpoint and the tool cannot run before Allow.</p>
                  <div className="approval-card__actions"><button type="button" className="button button--quiet" onClick={denyReplay}>Deny</button><button type="button" className="button button--approve" onClick={approveReplay}><ShieldCheck size={15} /> Allow rollback</button></div>
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
