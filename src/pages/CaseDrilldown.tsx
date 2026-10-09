import { Link, useParams } from "react-router-dom";
import { Badge, Card, FailureBadge, PageHeader, State, num } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import type { Chunk } from "../types";

function ChunkList({ chunks, citedIds = [] }: { chunks: Chunk[]; citedIds?: string[] }) {
  if (!chunks.length) return <p className="text-sm text-slate-500">None.</p>;
  return (
    <ul className="space-y-2">{chunks.map((c, i) => (
      <li key={`${c.id}-${i}`} className={`rounded-lg border p-3 text-sm ${c.is_gold ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}>
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-mono">#{i + 1} {c.id}</span>{c.score != null && <span>score {c.score.toFixed(3)}</span>}
          {c.is_gold && <Badge tone="green">gold</Badge>}{citedIds.includes(c.id) && <Badge tone="blue">cited</Badge>}
        </div>{c.text}
      </li>))}</ul>
  );
}

export default function CaseDrilldown() {
  const { runId = "", resultId = "" } = useParams();
  const { data: r, error, loading } = useFetch(() => api.result(resultId), [resultId]);
  if (!r) return <><PageHeader title="Case" /><State loading={loading} error={error} /></>;
  const cited = r.citations.map((c) => c.chunk_id);
  const missing = r.gold_chunks.filter((g) => !r.retrieved_chunks.some((c) => c.id === g.id));
  return (
    <>
      <PageHeader title={`Case ${r.case_id}`} subtitle={`Run ${r.run_id} · ${r.question_type}${r.is_unanswerable ? " · unanswerable" : ""}`}>
        <Link className="text-sm text-indigo-600 hover:underline" to={`/runs/${runId}`}>← back to run</Link>
      </PageHeader>
      <Card><div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase text-slate-500">Question</div><p className="text-lg font-medium">{r.question}</p></div>
        <FailureBadge category={r.failure_category} /></div>
        {r.error && <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">Error: {r.error}</p>}</Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Gold answer"><p className="text-sm">{r.gold_answer}</p>
          <h4 className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-500">Gold chunks</h4>
          <ChunkList chunks={r.gold_chunks.map((g) => ({ ...g, is_gold: true }))} /></Card>
        <Card title="Generated answer"><p className="text-sm">{r.answer || <em>(empty)</em>}</p>
          <h4 className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-500">Citations</h4>
          {r.citations.length === 0 ? <p className="text-sm text-slate-500">None.</p> : (
            <ul className="space-y-1 text-sm">{r.citations.map((c, i) => <li key={i}><span className="font-mono text-xs">{c.chunk_id}</span> {c.claim && <span className="text-slate-500">— {c.claim}</span>}</li>)}</ul>)}
          <div className="mt-4 flex gap-4 text-xs text-slate-500"><span>{r.latency_ms.toFixed(0)} ms</span><span>{r.input_tokens} in / {r.output_tokens} out tokens</span><span>cost {r.cost.toFixed(4)}</span></div></Card>
      </div>
      <Card title="Retrieved chunks (gold chunks highlighted)" className="mt-4">
        {missing.length > 0 && !r.is_unanswerable && <p className="mb-3 rounded bg-amber-50 p-2 text-sm text-amber-800">Missing gold chunks: {missing.map((m) => m.id).join(", ")}</p>}
        <ChunkList chunks={r.retrieved_chunks} citedIds={cited} /></Card>
      <Card title="Metric scores and judge reasoning" className="mt-4">
        <table className="w-full text-sm"><tbody>{r.metrics.map((m) => (
          <tr key={m.name} className="border-t align-top"><td className="py-2 pr-4 font-medium">{m.name}</td><td className="py-2 pr-4 font-mono">{num(m.score, 3)}</td>
            <td className="py-2 text-slate-600">{m.reasoning}{m.evidence.length > 0 && <ul className="mt-1 list-disc pl-5 text-xs text-slate-500">{m.evidence.slice(0, 4).map((e, i) => <li key={i}>{e}</li>)}</ul>}</td></tr>))}</tbody></table>
      </Card>
    </>
  );
}
