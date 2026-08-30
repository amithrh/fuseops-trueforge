import type { ReactNode } from "react";

interface MetricCardProps {
  eyebrow: string;
  value: string;
  note: string;
  tone?: "danger" | "safe" | "neutral";
  icon: ReactNode;
}

export function MetricCard({ eyebrow, value, note, tone = "neutral", icon }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__top">
        <span>{eyebrow}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

