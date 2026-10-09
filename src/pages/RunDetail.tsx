import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link, useParams } from "react-router-dom";
import { Card, FAILURE_COLORS, FAILURE_LABELS, FailureBadge, MetricCard, PageHeader, State, num, pct, td, th } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";

const LABELS: Record<string, string> = {
  recall_at_5: "Recall@5", precision_at_5: "Precision@5", mrr: "MRR", ndcg_at_5: "nDCG@5", faithfulness: "Faithfulness", relevance: "Relevance",
  correctness: "Correctness", hallucination_rate: "Hallucination rate", context_precision: "Context precision", context_recall: "Context recall",
  citation_correctness: "Citation correctness", refusal_accuracy: "Refusal accuracy",
};

export default function RunDetail() {
  const { runId = "" } = useParams();
  const [filter, setFilter] = useState<string>("");
  const metrics = useFetch(() => api.runMetrics(runId), [runId]);
  const run = useFetch(() => api.run(runId), [runId]);
  const results = useFetch(() => api.results(runId, filter || undefined), [runId, filter]);
  if (!metrics.data || !run.data) return <><PageHeader title={`Run ${runId}`} /><State loading={metrics.loading} error={metrics.error ?? run.error} /></>;
  const m = metrics.data;
  const failures = Object.entries(m.failure_counts).filter(([, v]) => v > 0).map(([k, v]) => ({ key: k, name: FAILURE_LABELS[k] ?? k, value: v }));
  return (
    <>
      <PageHeader title={`Run ${runId}`} subtitle={`${run.data.name} · commit ${run.data.git_commit} · config ${run.data.config_hash} · judge ${run.data.judge_model}`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {["faithfulness", "recall_at_5", "relevance", "hallucination_rate"].map((k) => <MetricCard key={k} label={LABELS[k]} value={pct(m.metrics[k])} />)}
        <MetricCard label="p50 / p95 latency" value={`${m.latency.p50?.toFixed(0)} / ${m.latency.p95?.toFixed(0)} ms`} />
        <MetricCard label="Tokens in / out" value={`${m.input_tokens} / ${m.output_tokens}`} />
        <MetricCard label="Total cost" value={m.total_cost.toFixed(4)} />
        <MetricCard label="Cases" value={String(m.n_cases)} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Metric breakdown">
          <table className="w-full"><tbody>{Object.entries(m.metrics).map(([k, v]) => (
            <tr key={k} className="border-t"><td className={td}>{LABELS[k] ?? k}</td><td className={`${td} text-right font-mono`}>{num(v, 3)}</td></tr>))}</tbody></table>
        </Card>
        <Card title="Failure categories">
          {failures.length === 0 ? <p className="text-sm text-slate-500">No failures 🎉</p> : (
            <div className="h-64"><ResponsiveContainer><BarChart data={failures} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={130} /><Tooltip />
              <Bar dataKey="value">{failures.map((f) => <Cell key={f.key} fill={FAILURE_COLORS[f.key] ?? "#64748b"} />)}</Bar>
            </BarChart></ResponsiveContainer></div>)}
        </Card>
        <Card title="By question type (mean scores)" className="lg:col-span-2">
          <table className="w-full"><thead><tr><th className={th}>Type</th>{["recall_at_5", "faithfulness", "correctness", "relevance"].map((k) => <th key={k} className={th}>{LABELS[k]}</th>)}</tr></thead>
            <tbody>{Object.entries(m.by_question_type).map(([t, v]) => (
              <tr key={t} className="border-t"><td className={td}>{t}</td>{["recall_at_5", "faithfulness", "correctness", "relevance"].map((k) => <td key={k} className={td}>{num(v[k])}</td>)}</tr>))}</tbody></table>
        </Card>
      </div>
      <Card title="Cases" className="mt-6">
        <select className="mb-3 rounded border px-2 py-1 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All cases</option><option value="none">Passing only</option>
          {Object.entries(FAILURE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <State loading={results.loading} error={results.error} />
        <table className="w-full"><thead><tr><th className={th}>Case</th><th className={th}>Question</th><th className={th}>Type</th><th className={th}>Status</th><th className={th}>Latency</th></tr></thead>
          <tbody>{results.data?.items.map((r) => (
            <tr key={r.id} className="border-t hover:bg-slate-50">
              <td className={td}><Link className="text-indigo-600 hover:underline" to={`/runs/${runId}/cases/${r.id}`}>{r.case_id}</Link></td>
              <td className={`${td} max-w-xl truncate`} title={r.question}>{r.question}</td><td className={td}>{r.question_type}</td>
              <td className={td}><FailureBadge category={r.failure_category} /></td><td className={td}>{r.latency_ms.toFixed(0)} ms</td></tr>))}</tbody></table>
      </Card>
    </>
  );
}
