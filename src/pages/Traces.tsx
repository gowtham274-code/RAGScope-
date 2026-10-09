import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, PageHeader, State, num, td, th } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";

export default function Traces() {
  const traces = useFetch(() => api.traces(50));
  const drift = useFetch(() => api.drift(7));
  return (
    <>
      <PageHeader title="Production traces" subtitle="Reference-free scores only (faithfulness, relevance, citations): production traffic has no gold answers" />
      <State loading={traces.loading} error={traces.error} />
      {drift.data && (
        <Card title={`Drift: last ${drift.data.window_days} days vs previous (${drift.data.n_traces} traces)`}>
          {drift.data.alerts.length === 0 ? <Badge tone="green">No drift alerts</Badge> : (
            <ul className="mb-3 space-y-1">{drift.data.alerts.map((a) => <li key={a.metric} className="rounded bg-red-50 p-2 text-sm text-red-700">⚠ {a.message}</li>)}</ul>)}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-56"><ResponsiveContainer><LineChart data={drift.data.series}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis domain={[0, 1]} /><Tooltip /><Legend />
              <Line dataKey="faithfulness" stroke="#6366f1" dot={false} /><Line dataKey="relevance" stroke="#f59e0b" dot={false} /><Line dataKey="no_answer_rate" stroke="#ef4444" dot={false} /></LineChart></ResponsiveContainer></div>
            <div className="h-56"><ResponsiveContainer><LineChart data={drift.data.series}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Legend />
              <Line dataKey="latency_ms" stroke="#10b981" dot={false} /></LineChart></ResponsiveContainer></div>
          </div>
        </Card>)}
      <Card title="Recent traces" className="mt-4"><table className="w-full"><thead><tr>{["Time", "Query", "Answer", "Latency", "Tokens", "Faithfulness", "Relevance"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>
        {traces.data?.items.map((t) => (<tr key={t.id} className="border-t">
          <td className={`${td} whitespace-nowrap`}>{new Date(t.created_at).toLocaleString()}{Boolean(t.metadata.simulated) && <div><Badge>simulated</Badge></div>}</td>
          <td className={`${td} max-w-xs truncate`} title={t.query}>{t.query}</td><td className={`${td} max-w-xs truncate text-slate-500`} title={t.answer}>{t.answer}</td>
          <td className={td}>{t.latency_ms.toFixed(0)} ms</td><td className={td}>{(t.tokens.input ?? 0) + (t.tokens.output ?? 0)}</td>
          <td className={td}>{t.is_no_answer ? <Badge tone="amber">no answer</Badge> : num(t.faithfulness)}</td><td className={td}>{num(t.relevance)}</td></tr>))}</tbody></table></Card>
    </>
  );
}
