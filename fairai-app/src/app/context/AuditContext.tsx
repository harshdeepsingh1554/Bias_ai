import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { AuditResult, DatasetUploadResponse } from "../api/fairnessApi";

export interface TimelineEvent {
  id: number;
  icon: "upload" | "model" | "dataset" | "audit" | "report" | "alert" | "fix";
  title: string;
  desc: string;
  time: string;
  color: string;
}

interface AuditState {
  // Project
  projectId: string | null;
  projectMode: "model" | "api" | null;

  // Upload tracking
  modelUploaded: boolean;
  datasetUploaded: boolean;
  datasetColumns: string[];
  datasetRows: number;

  // Audit
  auditResult: AuditResult | null;
  isAuditing: boolean;
  auditError: string | null;

  // Timeline
  timeline: TimelineEvent[];

  // Actions
  setProject: (id: string, mode: "model" | "api") => void;
  setModelUploaded: (v: boolean) => void;
  setDatasetInfo: (info: DatasetUploadResponse) => void;
  setAuditResult: (result: AuditResult) => void;
  setIsAuditing: (v: boolean) => void;
  setAuditError: (err: string | null) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, "id">) => void;
  resetProject: () => void;
}

const AuditContext = createContext<AuditState | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectMode, setProjectMode] = useState<"model" | "api" | null>(null);
  const [modelUploaded, setModelUploadedState] = useState(false);
  const [datasetUploaded, setDatasetUploadedState] = useState(false);
  const [datasetColumns, setDatasetColumns] = useState<string[]>([]);
  const [datasetRows, setDatasetRows] = useState(0);
  const [auditResult, setAuditResultState] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditingState] = useState(false);
  const [auditError, setAuditErrorState] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const nextIdRef = useRef(1);

  const setProject = useCallback((id: string, mode: "model" | "api") => {
    setProjectId(id);
    setProjectMode(mode);
  }, []);

  const setModelUploaded = useCallback((v: boolean) => {
    setModelUploadedState(v);
  }, []);

  const setDatasetInfo = useCallback((info: DatasetUploadResponse) => {
    setDatasetUploadedState(true);
    setDatasetColumns(info.columns);
    setDatasetRows(info.rows);
  }, []);

  const setAuditResult = useCallback((result: AuditResult) => {
    setAuditResultState(result);
  }, []);

  const setIsAuditing = useCallback((v: boolean) => {
    setIsAuditingState(v);
  }, []);

  const setAuditError = useCallback((err: string | null) => {
    setAuditErrorState(err);
  }, []);

  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, "id">) => {
    const id = nextIdRef.current++;
    setTimeline((prev) => [{ ...event, id }, ...prev]);
  }, []);

  const resetProject = useCallback(() => {
    setProjectId(null);
    setProjectMode(null);
    setModelUploadedState(false);
    setDatasetUploadedState(false);
    setDatasetColumns([]);
    setDatasetRows(0);
    setAuditResultState(null);
    setIsAuditingState(false);
    setAuditErrorState(null);
    setTimeline([]);
    nextIdRef.current = 1;
  }, []);

  return (
    <AuditContext.Provider
      value={{
        projectId,
        projectMode,
        modelUploaded,
        datasetUploaded,
        datasetColumns,
        datasetRows,
        auditResult,
        isAuditing,
        auditError,
        timeline,
        setProject,
        setModelUploaded,
        setDatasetInfo,
        setAuditResult,
        setIsAuditing,
        setAuditError,
        addTimelineEvent,
        resetProject,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used within AuditProvider");
  return ctx;
}
