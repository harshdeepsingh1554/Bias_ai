"""Fairness Audit Backend

A hackathon-friendly FastAPI backend for:
1) Upload model / API
2) Upload test dataset
3) Run fairness tests
4) Show bias metrics
5) Show SHAP explanations
6) Highlight bias
7) Suggest fixes
8) Generate report

Designed to be simple now and easy to extend later.

Recommended supported model formats for MVP:
- scikit-learn .pkl / .joblib
- black-box API endpoint (POST JSON)

Suggested frontend later:
- React / Next.js / Streamlit

Install (example):
    pip install fastapi uvicorn pandas numpy scikit-learn shap joblib pydantic requests jinja2 python-multipart

Run:
    uvicorn fairness_audit_backend:app --reload
"""

from __future__ import annotations

import io
import json
import os
import tempfile
import traceback
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
import requests
import shap
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field
from sklearn.base import BaseEstimator
from sklearn.metrics import accuracy_score

# Fairness libs are optional at runtime.
try:
    from fairlearn.metrics import (
        demographic_parity_difference,
        demographic_parity_ratio,
        equalized_odds_difference,
        equal_opportunity_difference,
    )
    FAIRLEARN_AVAILABLE = True
except Exception:
    FAIRLEARN_AVAILABLE = False

try:
    from sklearn.compose import ColumnTransformer
    from sklearn.impute import SimpleImputer
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    SKLEARN_PREPROCESS_AVAILABLE = True
except Exception:
    SKLEARN_PREPROCESS_AVAILABLE = False


app = FastAPI(title="Fairness Audit API", version="0.1.0")

# CORS – allow the Vite dev server (and any origin for hackathon convenience)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Data models
# -----------------------------

class UploadModelResponse(BaseModel):
    project_id: str
    mode: Literal["model", "api"]
    message: str


class DatasetUploadResponse(BaseModel):
    project_id: str
    rows: int
    columns: List[str]
    message: str


class AuditRequest(BaseModel):
    project_id: str
    target_column: str
    sensitive_column: str
    favorable_label: Optional[Any] = None
    prediction_column: Optional[str] = None

    # For API mode
    api_input_mapping: Optional[Dict[str, str]] = None
    api_output_key: Optional[str] = None

    # Optional controls
    positive_class_index: Optional[int] = 1
    threshold: float = 0.5


class AuditResult(BaseModel):
    project_id: str
    mode: str
    fairness_metrics: Dict[str, Any]
    accuracy: Optional[float] = None
    bias_flags: List[str] = Field(default_factory=list)
    fixes: List[str] = Field(default_factory=list)
    shap_summary: Optional[Dict[str, Any]] = None
    report_text: str
    created_at: str


# -----------------------------
# In-memory storage for hackathon MVP
# Replace with Redis/Postgres later
# -----------------------------

@dataclass
class ProjectState:
    project_id: str
    mode: Literal["model", "api"]
    model_path: Optional[str] = None
    api_config: Optional[Dict[str, Any]] = None
    dataset_path: Optional[str] = None
    uploaded_at: datetime = field(default_factory=datetime.utcnow)


PROJECTS: Dict[str, ProjectState] = {}
AUDIT_RESULTS: Dict[str, Dict[str, Any]] = {}


# -----------------------------
# Helpers
# -----------------------------


def new_project_id() -> str:
    return uuid.uuid4().hex[:12]


def save_upload_file(file: UploadFile, suffix: str = "") -> str:
    fd, path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return path


def load_dataset(path: str) -> pd.DataFrame:
    if path.lower().endswith(".csv"):
        return pd.read_csv(path)
    if path.lower().endswith(".parquet"):
        return pd.read_parquet(path)
    raise HTTPException(status_code=400, detail="Only CSV or Parquet dataset files are supported.")


def safe_load_model(path: str) -> Any:
    # MVP only: trusted local uploads from hackathon environment.
    # Later: isolate deserialization in a sandbox/container.
    if not (path.endswith(".pkl") or path.endswith(".joblib")):
        raise HTTPException(status_code=400, detail="Only .pkl or .joblib models are supported in MVP.")
    return joblib.load(path)


def infer_prediction_from_model(model: Any, df: pd.DataFrame, target_col: str) -> np.ndarray:
    X = df.drop(columns=[target_col], errors="ignore")
    print(f"[PREDICT] X columns: {list(X.columns)}, dtypes: {dict(X.dtypes)}, shape: {X.shape}")

    # If the model is a Pipeline, it might handle non-numeric data automatically.
    # We attempt to pass the original X first, then fall back to only numeric
    # columns if the model fails.
    numeric_X = X.select_dtypes(include=[np.number])

    last_error = None
    # Try both full X (preferred) and numeric_X (fallback)
    for label, features in [("all_columns", X), ("numeric_only", numeric_X)]:
        if features.empty:
            print(f"[PREDICT] Skipping {label}: empty")
            continue
        try:
            print(f"[PREDICT] Trying {label} with columns: {list(features.columns)}")
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(features)
                if proba.ndim == 2 and proba.shape[1] > 1:
                    print(f"[PREDICT] SUCCESS via predict_proba ({label})")
                    return (proba[:, 1] >= 0.5).astype(int)
                print(f"[PREDICT] SUCCESS via predict_proba ravel ({label})")
                return (proba.ravel() >= 0.5).astype(int)

            if hasattr(model, "predict"):
                pred = model.predict(features)
                print(f"[PREDICT] SUCCESS via predict ({label})")
                try:
                    return pred.astype(int)
                except Exception:
                    return np.array(pred)
        except Exception as exc:
            last_error = exc
            print(f"[PREDICT] FAILED {label}: {exc}")
            traceback.print_exc()
            continue

    detail = f"Model prediction failed: {last_error}" if last_error else "Uploaded model does not support provided dataset (check columns/types)."
    raise HTTPException(status_code=400, detail=detail)


def infer_api_predictions(api_config: Dict[str, Any], df: pd.DataFrame) -> np.ndarray:
    url = api_config["url"]
    headers = api_config.get("headers", {})
    input_mapping = api_config.get("input_mapping", {})
    output_key = api_config.get("output_key", "prediction")

    preds = []
    for _, row in df.iterrows():
        payload = {api_key: row[df_key] for df_key, api_key in input_mapping.items() if df_key in row.index}
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        body = resp.json()
        value = body.get(output_key)
        if value is None:
            raise HTTPException(status_code=400, detail=f"API response missing output key '{output_key}'.")
        preds.append(value)

    return np.array(preds)


def make_group_metrics(y_true: np.ndarray, y_pred: np.ndarray, sensitive: pd.Series) -> Dict[str, Any]:
    groups = {}
    unique_groups = list(pd.Series(sensitive).astype(str).fillna("Unknown").unique())
    for g in unique_groups:
        mask = pd.Series(sensitive).astype(str).fillna("Unknown") == g
        if mask.sum() == 0:
            continue
        groups[g] = {
            "count": int(mask.sum()),
            "selection_rate": float(np.mean(y_pred[mask])),
            "accuracy": float(accuracy_score(y_true[mask], y_pred[mask])) if len(np.unique(y_true[mask])) > 0 else None,
        }
    return groups


def compute_fairness_metrics(y_true: np.ndarray, y_pred: np.ndarray, sensitive: pd.Series) -> Dict[str, Any]:
    sensitive_s = pd.Series(sensitive).astype(str).fillna("Unknown")
    metrics: Dict[str, Any] = {
        "by_group": make_group_metrics(y_true, y_pred, sensitive_s),
    }

    # Simple, useful baseline metrics: compare largest and smallest group selection rates.
    group_rates = [v["selection_rate"] for v in metrics["by_group"].values() if v.get("selection_rate") is not None]
    if group_rates:
        metrics["selection_rate_gap"] = float(max(group_rates) - min(group_rates))
        metrics["selection_rate_ratio"] = float((min(group_rates) + 1e-9) / (max(group_rates) + 1e-9))
    else:
        metrics["selection_rate_gap"] = None
        metrics["selection_rate_ratio"] = None

    if FAIRLEARN_AVAILABLE:
        try:
            metrics["demographic_parity_difference"] = float(demographic_parity_difference(y_true, y_pred, sensitive_features=sensitive_s))
            metrics["demographic_parity_ratio"] = float(demographic_parity_ratio(y_true, y_pred, sensitive_features=sensitive_s))
            metrics["equal_opportunity_difference"] = float(equal_opportunity_difference(y_true, y_pred, sensitive_features=sensitive_s))
            metrics["equalized_odds_difference"] = float(equalized_odds_difference(y_true, y_pred, sensitive_features=sensitive_s))
        except Exception as exc:
            metrics["fairlearn_error"] = str(exc)
    else:
        metrics["fairlearn_error"] = "fairlearn not installed"

    return metrics


def highlight_bias(metrics: Dict[str, Any], threshold: float = 0.10) -> List[str]:
    flags: List[str] = []
    gap = metrics.get("selection_rate_gap")
    if gap is not None and gap > threshold:
        flags.append(f"Selection rate gap is {gap:.3f}, which exceeds threshold {threshold:.2f}.")

    dpd = metrics.get("demographic_parity_difference")
    if dpd is not None and abs(dpd) > threshold:
        flags.append(f"Demographic parity difference {dpd:.3f} indicates group disparity.")

    eod = metrics.get("equal_opportunity_difference")
    if eod is not None and abs(eod) > threshold:
        flags.append(f"Equal opportunity difference {eod:.3f} suggests qualified users are treated unevenly.")

    if not flags:
        flags.append("No strong fairness violation detected under the current threshold.")
    return flags


def suggest_fixes(metrics: Dict[str, Any], sensitive_column: str) -> List[str]:
    fixes = [
        "Check whether the sensitive column or its proxies should be removed from training.",
        "Balance the dataset with reweighting or resampling across groups.",
        "Try fairness-aware training constraints using Fairlearn or AIF360.",
        "Evaluate calibration and thresholds separately per group before deployment.",
    ]
    if metrics.get("selection_rate_gap", 0) and metrics["selection_rate_gap"] > 0.15:
        fixes.insert(0, f"Large selection gap detected on '{sensitive_column}': inspect the top predictive features and proxies first.")
    return fixes


def build_report_text(result: AuditResult) -> str:
    lines = []
    lines.append(f"# Fairness Audit Report")
    lines.append(f"Project ID: {result.project_id}")
    lines.append(f"Mode: {result.mode}")
    lines.append(f"Created at: {result.created_at}")
    lines.append("")
    lines.append("## Bias Metrics")
    lines.append(json.dumps(result.fairness_metrics, indent=2))
    lines.append("")
    lines.append("## Bias Flags")
    for flag in result.bias_flags:
        lines.append(f"- {flag}")
    lines.append("")
    lines.append("## Suggested Fixes")
    for fix in result.fixes:
        lines.append(f"- {fix}")
    lines.append("")
    if result.shap_summary:
        lines.append("## SHAP Summary")
        lines.append(json.dumps(result.shap_summary, indent=2))
    return "\n".join(lines)


def build_shap_summary_model(model: Any, df: pd.DataFrame, target_col: str, max_rows: int = 200) -> Optional[Dict[str, Any]]:
    """Best-effort SHAP summary.

    For hackathon MVP we keep this robust rather than perfect.
    If the model is incompatible, return None.
    """
    try:
        X = df.drop(columns=[target_col], errors="ignore").copy()
        if X.empty:
            return None

        # Use a small sample for speed.
        X_sample = X.sample(n=min(len(X), max_rows), random_state=42)

        # TreeExplainer works for many tree models. Otherwise fallback to generic explainer.
        try:
            explainer = shap.Explainer(model, X_sample)
            values = explainer(X_sample)
            abs_mean = np.abs(values.values).mean(axis=0)
            feature_names = list(X_sample.columns)
            top_idx = np.argsort(abs_mean)[::-1][:10]
            return {
                "top_features": [
                    {"feature": feature_names[i], "importance": float(abs_mean[i])}
                    for i in top_idx
                ]
            }
        except Exception:
            return None
    except Exception:
        return None


def build_shap_summary_api() -> Dict[str, Any]:
    # For black-box APIs, we cannot compute SHAP directly.
    return {
        "note": "SHAP is not available in pure black-box API mode unless you also have a local surrogate model.",
        "suggestion": "Train a local surrogate model on API outputs, then run SHAP on the surrogate.",
    }


# -----------------------------
# API endpoints
# -----------------------------


@app.get("/")
def health() -> Dict[str, Any]:
    return {"status": "ok", "service": "Fairness Audit API", "projects": len(PROJECTS)}


@app.post("/upload/model", response_model=UploadModelResponse)
async def upload_model(mode: Literal["model", "api"] = Form(...), file: Optional[UploadFile] = File(None)):
    project_id = new_project_id()

    if mode == "model":
        if file is None:
            raise HTTPException(status_code=400, detail="Model file is required for model mode.")
        if not (file.filename.endswith(".pkl") or file.filename.endswith(".joblib")):
            raise HTTPException(status_code=400, detail="Only .pkl or .joblib are accepted for MVP.")
        path = save_upload_file(file, suffix=os.path.splitext(file.filename)[1])
        PROJECTS[project_id] = ProjectState(project_id=project_id, mode="model", model_path=path)
        return UploadModelResponse(project_id=project_id, mode="model", message="Model uploaded successfully.")

    PROJECTS[project_id] = ProjectState(project_id=project_id, mode="api", api_config={})
    return UploadModelResponse(project_id=project_id, mode="api", message="API project created. Use /upload/api-config to set endpoint details.")


class APIConfigRequest(BaseModel):
    project_id: str
    url: str
    headers: Dict[str, str] = Field(default_factory=dict)
    input_mapping: Dict[str, str] = Field(default_factory=dict)
    output_key: str = "prediction"


@app.post("/upload/api-config")
def upload_api_config(payload: APIConfigRequest):
    project = PROJECTS.get(payload.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    if project.mode != "api":
        raise HTTPException(status_code=400, detail="Project is not in API mode.")
    project.api_config = payload.model_dump()
    return {"message": "API config saved.", "project_id": payload.project_id}


@app.post("/upload/dataset", response_model=DatasetUploadResponse)
async def upload_dataset(project_id: str = Form(...), file: UploadFile = File(...)):
    project = PROJECTS.get(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    path = save_upload_file(file, suffix=os.path.splitext(file.filename)[1])
    project.dataset_path = path
    df = load_dataset(path)
    return DatasetUploadResponse(project_id=project_id, rows=len(df), columns=list(df.columns), message="Dataset uploaded successfully.")


@app.post("/audit", response_model=AuditResult)
def run_audit(req: AuditRequest):
    project = PROJECTS.get(req.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    if not project.dataset_path:
        raise HTTPException(status_code=400, detail="Upload a dataset first.")

    df = load_dataset(project.dataset_path)
    if req.target_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{req.target_column}' not found in dataset.")
    if req.sensitive_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Sensitive column '{req.sensitive_column}' not found in dataset.")

    y_true = df[req.target_column].copy()
    sensitive = df[req.sensitive_column].copy()

    if project.mode == "model":
        if not project.model_path:
            raise HTTPException(status_code=400, detail="Model file not found for this project.")
        model = safe_load_model(project.model_path)
        y_pred = infer_prediction_from_model(model, df, req.target_column)
        shap_summary = build_shap_summary_model(model, df, req.target_column)
        accuracy = float(accuracy_score(y_true, y_pred)) if len(np.unique(y_true)) > 1 else None

    else:
        if not project.api_config:
            raise HTTPException(status_code=400, detail="API config not set.")
        y_pred = infer_api_predictions(project.api_config, df)
        shap_summary = build_shap_summary_api()
        accuracy = float(accuracy_score(y_true, y_pred)) if len(np.unique(y_true)) > 1 else None

    metrics = compute_fairness_metrics(y_true.to_numpy(), np.asarray(y_pred), sensitive)
    flags = highlight_bias(metrics)
    fixes = suggest_fixes(metrics, req.sensitive_column)

    result = AuditResult(
        project_id=req.project_id,
        mode=project.mode,
        fairness_metrics=metrics,
        accuracy=accuracy,
        bias_flags=flags,
        fixes=fixes,
        shap_summary=shap_summary,
        report_text="",
        created_at=datetime.utcnow().isoformat(),
    )
    result.report_text = build_report_text(result)

    AUDIT_RESULTS[req.project_id] = result.model_dump()
    return result


@app.get("/report/{project_id}")
def get_report(project_id: str):
    result = AUDIT_RESULTS.get(project_id)
    if result is None:
        raise HTTPException(status_code=404, detail="No audit report found for this project.")
    return PlainTextResponse(result["report_text"])


@app.get("/result/{project_id}")
def get_result(project_id: str):
    result = AUDIT_RESULTS.get(project_id)
    if result is None:
        raise HTTPException(status_code=404, detail="No result found for this project.")
    return JSONResponse(result)


@app.get("/projects")
def list_projects():
    """List all projects with basic info."""
    result = []
    for pid, ps in PROJECTS.items():
        result.append({
            "project_id": ps.project_id,
            "mode": ps.mode,
            "has_model": ps.model_path is not None,
            "has_api_config": ps.api_config is not None and bool(ps.api_config),
            "has_dataset": ps.dataset_path is not None,
            "has_audit": pid in AUDIT_RESULTS,
            "uploaded_at": ps.uploaded_at.isoformat(),
        })
    return result


@app.get("/projects/{project_id}")
def get_project(project_id: str):
    project = PROJECTS.get(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {
        "project_id": project.project_id,
        "mode": project.mode,
        "has_model": project.model_path is not None,
        "has_api_config": project.api_config is not None and bool(project.api_config),
        "has_dataset": project.dataset_path is not None,
        "has_audit": project_id in AUDIT_RESULTS,
        "uploaded_at": project.uploaded_at.isoformat(),
    }


# -----------------------------
# Notes for later improvements
# -----------------------------
"""
Things to improve later before frontend integration:

1) Persist data in a database:
   - Use PostgreSQL for projects and audit results
   - Store file paths in object storage (S3/GCS/local volume)

2) Background jobs:
   - Move /audit to Celery/RQ/Arq so large models/APIs do not block requests

3) Better model format support:
   - ONNX for safe inference
   - TensorFlow SavedModel / PyTorch optional, only if needed

4) Better SHAP handling:
   - Separate explainers for tree, linear, and text models
   - For API mode, train a surrogate model to approximate outputs

5) More fairness metrics:
   - Calibration by group
   - Predictive parity
   - TPR/FPR parity
   - Intersectional fairness (e.g., gender + age)

6) Better bias thresholds:
   - User-configurable thresholds per use case
   - Different defaults for hiring vs lending vs healthcare

7) Security:
   - Never load untrusted pickle files in production without sandboxing
   - Validate API URLs and rate limit external requests

8) Frontend contract:
   - Keep endpoints JSON-first so React/Next.js can consume them easily
   - Consider adding OpenAPI examples for each endpoint
"""
