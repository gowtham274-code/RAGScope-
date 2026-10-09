import type { ReactNode } from "react";

export const pct = (v: number | null | undefined, digits = 1) => (v == null ? "–" : `${(v * 100).toFixed(digits)}%`);
export const num = (v: number | null | undefined, digits = 2) => (v == null ? "–" : v.toFixed(digits));

export const FAILURE_LABELS: Record<string, string> = {
  retrieval_miss: "Retrieval miss", hallucination: "Hallucination", incomplete_answer: "Incomplete answer",
  wrong_refusal: "Wrong refusal", citation_error: "Citation error", low_relevance: "Low relevance", system_error: "System error",
};
export const FAILURE_COLORS: Record<string, string> = {
  retrieval_miss: "#ef4444", hallucination: "#f97316", incomplete_answer: "#eab308", wrong_refusal: "#8b5cf6",
  citation_error: "#06b6d4", low_relevance: "#64748b", system_error: "#be123c",
};

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {title && <h3 className="mb-3 text-sm font-semibold text-slate-600">{title}</h3>}
      {children}
    </section>
  );
}

export function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "red" | "amber" | "blue" }) {
  const tones = { slate: "bg-slate-100 text-slate-700", green: "bg-emerald-100 text-emerald-700", red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700", blue: "bg-blue-100 text-blue-700" };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function FailureBadge({ category }: { category: string | null }) {
  return category ? <Badge tone="red">{FAILURE_LABELS[category] ?? category}</Badge> : <Badge tone="green">pass</Badge>;
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}</div>
      <div>{children}</div>
    </div>
  );
}

export function State({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}. Is the API running? (<code>ragscope serve</code>)</div>;
  return null;
}

export const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
export const td = "px-3 py-2 text-sm";
