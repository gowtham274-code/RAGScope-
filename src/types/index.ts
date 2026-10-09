export interface Page<T> { items: T[]; total: number; limit: number; offset: number }
export interface Run {
  id: string; project_id: string; dataset_id: string; name: string; status: string; git_commit: string; config_hash: string;
  embedding_model: string; llm_model: string; judge_model: string; chunk_size: number | null; chunk_overlap: number | null;
  prompt_version: string; started_at: string; completed_at: string | null;
  summary: { metrics?: Record<string, number>; latency?: Record<string, number>; failure_counts?: Record<string, number>; total_cost?: number; n_cases?: number };
}
export interface RunMetrics {
  run_id: string; metrics: Record<string, number>; latency: Record<string, number>; failure_counts: Record<string, number>;
  total_cost: number; input_tokens: number; output_tokens: number; n_cases: number; by_question_type: Record<string, Record<string, number>>;
}
export interface ResultRow {
  id: string; case_id: string; question: string; question_type: string; answer: string; failure_category: string | null;
  latency_ms: number; metrics: Record<string, number | null>;
}
export interface Chunk { id: string; text: string; score?: number; is_gold?: boolean }
export interface ResultDetail {
  id: string; run_id: string; case_id: string; question: string; question_type: string; is_unanswerable: boolean; gold_answer: string;
  gold_chunks: Chunk[]; retrieved_chunks: Chunk[]; answer: string; citations: { chunk_id: string; claim?: string }[];
  failure_category: string | null; error: string | null; latency_ms: number; input_tokens: number; output_tokens: number; cost: number;
  metrics: { name: string; score: number | null; reasoning: string; evidence: string[] }[];
}
export interface Overview {
  total_runs: number; total_traces: number; avg_faithfulness: number | null; avg_recall_at_5: number | null; avg_relevance: number | null;
  avg_hallucination_rate: number | null; avg_latency_p50_ms: number | null; avg_cost_per_query: number | null; latest_run_id: string | null;
  trend: { run_id: string; name: string; date: string; faithfulness: number | null; recall_at_5: number | null; relevance: number | null }[];
  recent_runs: { id: string; name: string; status: string; started_at: string; faithfulness: number | null; recall_at_5: number | null }[];
}
export interface MetricComparison {
  metric: string; baseline_mean: number; candidate_mean: number; delta: number; ci_low: number; ci_high: number; p_value: number;
  is_regression: boolean; max_drop: number | null; status: string; n_pairs: number;
}
export interface Comparison { baseline_id: string; candidate_id: string; passed: boolean; comparisons: MetricComparison[]; reasons: string[] }
export interface Dataset { id: string; project_id: string; name: string; version: string; description: string; created_at: string; n_cases: number; by_type: Record<string, number>; by_status: Record<string, number> }
export interface Case { id: string; external_id: string; question: string; gold_answer: string; gold_chunk_ids: string[]; question_type: string; is_unanswerable: boolean; review_status: string }
export interface Trace {
  id: string; query: string; answer: string; latency_ms: number; tokens: { input?: number; output?: number }; feedback: string | null;
  faithfulness: number | null; relevance: number | null; citation_correctness: number | null; is_no_answer: boolean; metadata: Record<string, unknown>; created_at: string;
}
export interface Drift {
  window_days: number; n_traces: number; alerts: { metric: string; current: number; previous: number; message: string }[];
  series: Record<string, number | string | null>[];
}
