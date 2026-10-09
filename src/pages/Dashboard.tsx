import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { Card, MetricCard, PageHeader, State, num, pct, td, th } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";

export default function Dashboard() {
  const { data, error, loading } = useFetch(() => api.overview());
  if (!data) return <><PageHeader title="Dashboard" /><State loading={loading} error={error} /></>;
  const trend = data.trend.map((t) => ({ ...t, label: t.run_id }));
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Quality of your RAG application across evaluation runs" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Evaluation runs" value={String(data.total_runs)} hint={`${data.total_traces} production traces`} />
        <MetricCard label="Avg faithfulness" value={pct(data.avg_faithfulness)} />
        <MetricCard label="Avg Recall@5" value={pct(data.avg_recall_at_5)} />
        <MetricCard label="Avg answer relevance" value={pct(data.avg_relevance)} />
        <MetricCard label="Avg hallucination rate" value={pct(data.avg_hallucination_rate)} />
        <MetricCard label="Median latency" value={data.avg_latency_p50_ms == null ? "–" : `${data.avg_latency_p50_ms} ms`} hint="as reported by adapter" />
        <MetricCard label="Cost per query" value={data.avg_cost_per_query == null ? "–" : data.avg_cost_per_query.toFixed(4)} hint="configured pricing" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Quality trend by run" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis domain={[0, 1]} /><Tooltip /><Legend />
                <Line dataKey="faithfulness" stroke="#6366f1" /><Line dataKey="recall_at_5" stroke="#10b981" /><Line dataKey="relevance" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Recent runs">
          <table className="w-full"><thead><tr><th className={th}>Run</th><th className={th}>Faith.</th><th className={th}>R@5</th></tr></thead>
            <tbody>{data.recent_runs.map((r) => (
              <tr key={r.id} className="border-t"><td className={td}><Link className="text-indigo-600 hover:underline" to={`/runs/${r.id}`}>{r.id}</Link></td>
                <td className={td}>{num(r.faithfulness)}</td><td className={td}>{num(r.recall_at_5)}</td></tr>))}</tbody></table>
        </Card>
      </div>
    </>
  );
}
