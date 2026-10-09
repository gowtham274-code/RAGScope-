import { Link } from "react-router-dom";
import { Badge, Card, PageHeader, State, num, td, th } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";

export default function Runs() {
  const { data, error, loading } = useFetch(() => api.runs());
  const datasets = useFetch(() => api.datasets());
  const dsName = (id: string) => datasets.data?.items.find((d) => d.id === id)?.name ?? id;
  return (
    <>
      <PageHeader title="Runs" subtitle="Every evaluation run, newest first" />
      <State loading={loading} error={error} />
      {data && (
        <Card>
          <table className="w-full">
            <thead><tr>{["Run", "Dataset", "Model", "Date", "Status", "Faithfulness", "Recall@5", "p95 latency"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody>{data.items.map((r) => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                <td className={td}><Link className="font-medium text-indigo-600 hover:underline" to={`/runs/${r.id}`}>{r.id}</Link><div className="text-xs text-slate-400">{r.name}</div></td>
                <td className={td}>{dsName(r.dataset_id)}</td><td className={td}>{r.llm_model}</td>
                <td className={td}>{new Date(r.started_at).toLocaleString()}</td>
                <td className={td}><Badge tone={r.status === "completed" ? "green" : "amber"}>{r.status}</Badge></td>
                <td className={td}>{num(r.summary.metrics?.faithfulness)}</td><td className={td}>{num(r.summary.metrics?.recall_at_5)}</td>
                <td className={td}>{r.summary.latency?.p95 == null ? "–" : `${r.summary.latency.p95.toFixed(0)} ms`}</td>
              </tr>))}</tbody>
          </table>
          {data.items.length === 0 && <p className="p-4 text-sm text-slate-500">No runs yet. Run <code>ragscope demo</code>.</p>}
        </Card>
      )}
    </>
  );
}
