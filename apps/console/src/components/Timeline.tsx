import { CheckCircle2, CircleDot, FlaskConical, GitBranch, PauseCircle, Radio } from "lucide-react";
import type { Snapshot } from "../types";

const icons: Record<string, typeof Radio> = {
  "incident.opened": Radio,
  "evidence.read": CircleDot,
  "subagent.completed": GitBranch,
  "sandbox.completed": FlaskConical,
  "approval.waiting": PauseCircle,
  "rollback.completed": CheckCircle2,
  "incident.resolved": CheckCircle2,
};

export function Timeline({ events }: { events: Snapshot["audit"] }) {
  return (
    <div className="timeline" aria-label="Incident evidence timeline">
      {events.length === 0 ? <p className="empty-state">Waiting for the first tool call.</p> : null}
      {events.map((event, index) => {
        const Icon = icons[event.kind] ?? CircleDot;
        return (
          <article className="timeline__event" key={event.id} style={{ "--delay": `${index * 30}ms` } as React.CSSProperties}>
            <span className="timeline__rail"><Icon size={15} /></span>
            <div>
              <div className="timeline__meta">
                <span>{event.kind.replaceAll(".", " / ")}</span>
                <time>{new Date(event.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
              </div>
              <h3>{event.summary}</h3>
              {event.detail ? <p>{event.detail}</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

