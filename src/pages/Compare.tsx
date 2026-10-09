import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, PageHeader, State, num, td, th } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";

export default function Compare() {
  const runs = useFetch(() => api.runs());
  const [base, setBase] = useState(""); const [cand, setCand] = useState("");
  useEffect(() => {
    const items = runs.data?.items ?? [];
    if (items.length >= 2 && !base && !cand) { setBase(items[items.length - 1].id); setCand(items[0].id); }
  }, [runs.data, base, cand]);
  const cmp = useFetch(() => (base && cand ? api.compare(base, cand) : Promise.resolve(null)), [base, cand]);
  const rows = (cmp.data?.comparisons ?? []).filter((c) => c.status !== "INFO" || ["recall_at_5", "relevance", "correctness"].includes(c.metric));
  const select = (v: string, set: (s: string) => void) => (
    <select className="rounded border px-2 py-1 text-sm" value={v} onChange={(e) => set(e.target.value)}>
      <option value="">select run…</option>{runs.data?.items.map((r) => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)}
    </select>);
  return (
    <>
      <PageHeader title="Compare runs" subtitle="Paired bootstrap confidence intervals and a paired t-test over shared test cases" />
      <Card><div className="flex flex-wrap items-center gap-3 text-sm">Baseline {select(base, setBase)} Candidate {select(cand, setCand)}</div></Card>
      <State loading={cmp.loading && !!(base && cand)} error={cmp.error} />
      {cmp.data && (<>
        <div className={`mt-4 rounded-xl border p-4 ${cmp.data.passed ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
          <div className="text-lg font-semibold">{cmp.data.passed ? "✅ No regression detected" : "❌ Regression detected"}</div>
          {cmp.data.reasons.map((r) => <p key={r} className="text-sm">{r}</p>)}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Baseline vs candidate"><div className="h-72"><ResponsiveContainer>
            <BarChart data={rows.map((c) => ({ metric: c.metric, baseline: c.baseline_mean, candidate: c.candidate_mean }))}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="metric" tick={{ fontSize: 10 }} /><YAxis domain={[0, 1]} /><Tooltip /><Legend />
              <Bar dataKey="baseline" fill="#94a3b8" /><Bar dataKey="candidate" fill="#6366f1" /></BarChart></ResponsiveContainer></div></Card>
          <Card title="Delta with 95% CI">
            <table className="w-full"><thead><tr>{["Metric", "Δ", "95% CI", "p", "Status"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody>{cmp.data.comparisons.map((c) => (
                <tr key={c.metric} className="border-t"><td className={td}>{c.metric}</td>
                  <td className={`${td} font-mono ${c.delta < 0 ? "text-red-600" : "text-emerald-600"}`}>{c.delta >= 0 ? "+" : ""}{num(c.delta, 3)}</td>
                  <td className={`${td} font-mono text-xs`}>[{num(c.ci_low, 3)}, {num(c.ci_high, 3)}]</td><td className={td}>{num(c.p_value, 3)}</td>
                  <td className={td}><Badge tone={c.status === "FAIL" ? "red" : c.status === "PASS" ? "green" : "slate"}>{c.status}</Badge></td></tr>))}</tbody></table>
          </Card>
        </div></>)}
      {!cmp.data && !cmp.loading && <p className="mt-4 text-sm text-slate-500">Pick two runs (the demo creates demo-001 and demo-002).</p>}
    </>
  );
}
