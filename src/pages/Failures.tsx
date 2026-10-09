import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { Card, FAILURE_COLORS, FAILURE_LABELS, PageHeader, State, td, th } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";

const RULES: Record<string, string> = {
  retrieval_miss: "Recall@5 below 0.5", hallucination: "Retrieval fine but faithfulness below 0.8",
  incomplete_answer: "Retrieval and faithfulness fine but correctness below 0.6", wrong_refusal: "Unanswerable question that received an answer",
  citation_error: "Cited chunk does not support the claim", low_relevance: "Answer does not address the question", system_error: "Adapter timeout / error",
};

export default function Failures() {
  const runs = useFetch(() => api.runs());
  const [runId, setRunId] = useState("");
  const id = runId || runs.data?.items[0]?.id || "";
  const metrics = useFetch(() => (id ? api.runMetrics(id) : Promise.resolve(null)), [id]);
  const [cat, setCat] = useState("hallucination");
  const cases = useFetch(() => (id ? api.results(id, cat) : Promise.resolve(null)), [id, cat]);
  const data = Object.keys(FAILURE_LABELS).map((k) => ({ key: k, name: FAILURE_LABELS[k], count: metrics.data?.failure_counts[k] ?? 0 }));
  return (
    <>
      <PageHeader title="Failure taxonomy" subtitle="Automatic diagnosis of every failing case">
        <select className="rounded border px-2 py-1 text-sm" value={id} onChange={(e) => setRunId(e.target.value)}>{runs.data?.items.map((r) => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)}</select>
      </PageHeader>
      <State loading={metrics.loading} error={metrics.error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Counts"><div className="h-72"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip />
          <Bar dataKey="count" onClick={(d) => setCat((d as { key: string }).key)}>{data.map((d) => <Cell key={d.key} fill={FAILURE_COLORS[d.key]} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
        <Card title="Rules"><ul className="space-y-1 text-sm">{Object.entries(RULES).map(([k, v]) => (
          <li key={k}><button className={`font-medium ${k === cat ? "text-indigo-700" : "text-slate-700"}`} onClick={() => setCat(k)}>{FAILURE_LABELS[k]}</button> — <span className="text-slate-500">{v}</span></li>))}</ul></Card>
      </div>
      <Card title={`Cases: ${FAILURE_LABELS[cat]}`} className="mt-4">
        <table className="w-full"><thead><tr><th className={th}>Case</th><th className={th}>Question</th><th className={th}>Answer</th></tr></thead><tbody>
          {cases.data?.items.map((r) => (<tr key={r.id} className="border-t"><td className={td}><Link className="text-indigo-600 hover:underline" to={`/runs/${id}/cases/${r.id}`}>{r.case_id}</Link></td>
            <td className={`${td} max-w-md truncate`}>{r.question}</td><td className={`${td} max-w-md truncate text-slate-500`}>{r.answer}</td></tr>))}</tbody></table>
        {cases.data?.items.length === 0 && <p className="text-sm text-slate-500">No cases in this category.</p>}
      </Card>
    </>
  );
}
