/**
 * FairAI Backend API client.
 * All calls go through the Vite proxy: /api → http://localhost:8000
 */

const BASE = "/api";

/** Safely extract an error message from a backend response.
 *  FastAPI returns JSON `{ detail: "..." }` for 4xx, but a plain-text
 *  "Internal Server Error" for unhandled 500s — which breaks `res.json()`.
 */
async function safeErrorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body?.detail || fallback;
  } catch {
    // Body wasn't valid JSON (e.g. 500 "Internal Server Error")
    return `${fallback} (HTTP ${res.status})`;
  }
}

export interface UploadModelResponse {
  project_id: string;
  mode: "model" | "api";
  message: string;
}

export interface DatasetUploadResponse {
  project_id: string;
  rows: number;
  columns: string[];
  message: string;
}

export interface AuditRequest {
  project_id: string;
  target_column: string;
  sensitive_column: string;
  favorable_label?: any;
  prediction_column?: string;
  api_input_mapping?: Record<string, string>;
  api_output_key?: string;
  positive_class_index?: number;
  threshold?: number;
}

export interface GroupMetrics {
  count: number;
  selection_rate: number;
  accuracy: number | null;
}

export interface FairnessMetrics {
  by_group: Record<string, GroupMetrics>;
  selection_rate_gap: number | null;
  selection_rate_ratio: number | null;
  demographic_parity_difference?: number;
  demographic_parity_ratio?: number;
  equal_opportunity_difference?: number;
  equalized_odds_difference?: number;
  fairlearn_error?: string;
}

export interface ShapFeature {
  feature: string;
  importance: number;
}

export interface ShapSummary {
  top_features?: ShapFeature[];
  note?: string;
  suggestion?: string;
}

export interface AuditResult {
  project_id: string;
  mode: string;
  fairness_metrics: FairnessMetrics;
  accuracy: number | null;
  bias_flags: string[];
  fixes: string[];
  shap_summary: ShapSummary | null;
  report_text: string;
  created_at: string;
}

export interface ProjectInfo {
  project_id: string;
  mode: "model" | "api";
  has_model: boolean;
  has_api_config: boolean;
  has_dataset: boolean;
  has_audit: boolean;
  uploaded_at: string;
}

// ---- API calls ----

export async function uploadModel(file: File): Promise<UploadModelResponse> {
  const fd = new FormData();
  fd.append("mode", "model");
  fd.append("file", file);
  const res = await fetch(`${BASE}/upload/model`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await safeErrorDetail(res, "Upload failed"));
  return res.json();
}

export async function createApiProject(): Promise<UploadModelResponse> {
  const fd = new FormData();
  fd.append("mode", "api");
  const res = await fetch(`${BASE}/upload/model`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await safeErrorDetail(res, "Create failed"));
  return res.json();
}

export async function uploadApiConfig(payload: {
  project_id: string;
  url: string;
  headers?: Record<string, string>;
  input_mapping?: Record<string, string>;
  output_key?: string;
}) {
  const res = await fetch(`${BASE}/upload/api-config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await safeErrorDetail(res, "Config failed"));
  return res.json();
}

export async function uploadDataset(
  projectId: string,
  file: File
): Promise<DatasetUploadResponse> {
  const fd = new FormData();
  fd.append("project_id", projectId);
  fd.append("file", file);
  const res = await fetch(`${BASE}/upload/dataset`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await safeErrorDetail(res, "Dataset upload failed"));
  return res.json();
}

export async function runAudit(req: AuditRequest): Promise<AuditResult> {
  const res = await fetch(`${BASE}/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await safeErrorDetail(res, "Audit failed"));
  return res.json();
}

export async function getResult(projectId: string): Promise<AuditResult> {
  const res = await fetch(`${BASE}/result/${projectId}`);
  if (!res.ok) throw new Error(await safeErrorDetail(res, "Not found"));
  return res.json();
}

export async function getReport(projectId: string): Promise<string> {
  const res = await fetch(`${BASE}/report/${projectId}`);
  if (!res.ok) throw new Error("Report not found");
  return res.text();
}

export async function listProjects(): Promise<ProjectInfo[]> {
  const res = await fetch(`${BASE}/projects`);
  if (!res.ok) return [];
  return res.json();
}

export async function getProject(projectId: string): Promise<ProjectInfo> {
  const res = await fetch(`${BASE}/projects/${projectId}`);
  if (!res.ok) throw new Error("Project not found");
  return res.json();
}
