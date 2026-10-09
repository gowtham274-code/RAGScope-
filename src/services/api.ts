import type { Case, Comparison, Dataset, Drift, Overview, Page, ResultDetail, ResultRow, Run, RunMetrics, Trace } from "../types";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  overview: () => request<Overview>("/overview"),
  runs: (limit = 100) => request<Page<Run>>(`/runs?limit=${limit}`),
  run: (id: string) => request<Run>(`/runs/${id}`),
  runMetrics: (id: string) => request<RunMetrics>(`/runs/${id}/metrics`),
  results: (id: string, failure?: string, limit = 100) =>
    request<Page<ResultRow>>(`/runs/${id}/results?limit=${limit}${failure ? `&failure_category=${failure}` : ""}`),
  result: (id: string) => request<ResultDetail>(`/results/${id}`),
  compare: (baseline: string, candidate: string) => request<Comparison>(`/compare?baseline_id=${baseline}&candidate_id=${candidate}`),
  datasets: () => request<Page<Dataset>>("/datasets"),
  cases: (datasetId: string, status?: string, limit = 100) =>
    request<Page<Case>>(`/datasets/${datasetId}/cases?limit=${limit}${status ? `&review_status=${status}` : ""}`),
  reviewCase: (datasetId: string, caseId: string, body: Partial<Pick<Case, "review_status" | "question" | "gold_answer">>) =>
    request<Case>(`/datasets/${datasetId}/cases/${caseId}`, { method: "PATCH", body: JSON.stringify(body) }),
  traces: (limit = 50) => request<Page<Trace>>(`/traces?limit=${limit}`),
  drift: (windowDays = 7) => request<Drift>(`/drift?window_days=${windowDays}`),
};
