import { useState } from "react";
import { Badge, Card, MetricCard, PageHeader, State, td, th } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import type { Case } from "../types";

export default function Datasets() {
  const datasets = useFetch(() => api.datasets());
  const [selected, setSelected] = useState("");
  const ds = datasets.data?.items.find((d) => d.id === selected) ?? datasets.data?.items[0];
  const cases = useFetch(() => (ds ? api.cases(ds.id) : Promise.resolve(null)), [ds?.id]);
  const [editing, setEditing] = useState<Case | null>(null);
  const [draft, setDraft] = useState({ question: "", gold_answer: "" });
  const review = async (c: Case, status: "approved" | "rejected") => { await api.reviewCase(ds!.id, c.id, { review_status: status }); cases.reload(); datasets.reload(); };
  const save = async () => { if (!editing) return; await api.reviewCase(ds!.id, editing.id, draft); setEditing(null); cases.reload(); };
  return (
    <>
      <PageHeader title="Datasets & human review" subtitle="Approve, reject or edit generated test cases to build the final golden dataset">
        <select className="rounded border px-2 py-1 text-sm" value={ds?.id ?? ""} onChange={(e) => setSelected(e.target.value)}>{datasets.data?.items.map((d) => <option key={d.id} value={d.id}>{d.name} v{d.version}</option>)}</select>
      </PageHeader>
      <State loading={datasets.loading} error={datasets.error} />
      {ds && (<>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Test cases" value={String(ds.n_cases)} />
          <MetricCard label="Approved" value={String(ds.by_status.approved ?? 0)} />
          <MetricCard label="Rejected" value={String(ds.by_status.rejected ?? 0)} />
          <MetricCard label="Pending review" value={String(ds.by_status.pending ?? 0)} />
        </div>
        <Card title="Question types" className="mt-4"><div className="flex flex-wrap gap-2">{Object.entries(ds.by_type).map(([k, v]) => <Badge key={k} tone="blue">{k}: {v}</Badge>)}</div></Card>
        <Card title="Cases" className="mt-4"><table className="w-full"><thead><tr>{["ID", "Type", "Question", "Gold answer", "Gold chunks", "Status", ""].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>
          {cases.data?.items.map((c) => (<tr key={c.id} className="border-t align-top">
            <td className={td}>{c.external_id}</td><td className={td}>{c.question_type}</td><td className={`${td} max-w-xs`}>{c.question}</td>
            <td className={`${td} max-w-xs text-slate-600`}>{c.gold_answer}</td><td className={`${td} font-mono text-xs`}>{c.gold_chunk_ids.join(", ") || "–"}</td>
            <td className={td}><Badge tone={c.review_status === "approved" ? "green" : c.review_status === "rejected" ? "red" : "amber"}>{c.review_status}</Badge></td>
            <td className={`${td} whitespace-nowrap`}><button className="mr-2 text-emerald-700 hover:underline" onClick={() => review(c, "approved")}>Approve</button>
              <button className="mr-2 text-red-700 hover:underline" onClick={() => review(c, "rejected")}>Reject</button>
              <button className="text-indigo-700 hover:underline" onClick={() => { setEditing(c); setDraft({ question: c.question, gold_answer: c.gold_answer }); }}>Edit</button></td></tr>))}</tbody></table></Card></>)}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
          <h3 className="mb-3 font-semibold">Edit {editing.external_id}</h3>
          <label className="text-xs text-slate-500">Question</label><textarea className="mb-3 w-full rounded border p-2 text-sm" rows={3} value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
          <label className="text-xs text-slate-500">Gold answer</label><textarea className="mb-3 w-full rounded border p-2 text-sm" rows={4} value={draft.gold_answer} onChange={(e) => setDraft({ ...draft, gold_answer: e.target.value })} />
          <div className="flex justify-end gap-2"><button className="rounded border px-3 py-1 text-sm" onClick={() => setEditing(null)}>Cancel</button>
            <button className="rounded bg-indigo-600 px-3 py-1 text-sm text-white" onClick={save}>Save</button></div></div></div>)}
    </>
  );
}
