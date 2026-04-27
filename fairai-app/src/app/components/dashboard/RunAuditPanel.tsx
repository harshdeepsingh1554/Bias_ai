import { motion, AnimatePresence } from "motion/react";
import { Play, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { runAudit } from "../../api/fairnessApi";

export function RunAuditPanel({ onComplete }: { onComplete?: () => void }) {
  const {
    projectId,
    datasetUploaded,
    datasetColumns,
    setAuditResult,
    setIsAuditing,
    setAuditError,
    isAuditing,
    auditResult,
    auditError,
    addTimelineEvent,
  } = useAudit();

  const [targetColumn, setTargetColumn] = useState("");
  const [sensitiveColumn, setSensitiveColumn] = useState("");
  const [targetOpen, setTargetOpen] = useState(false);
  const [sensitiveOpen, setSensitiveOpen] = useState(false);

  const canRun = projectId && datasetUploaded && targetColumn && sensitiveColumn && !isAuditing;

  const handleRun = async () => {
    if (!projectId || !targetColumn || !sensitiveColumn) return;
    setIsAuditing(true);
    setAuditError(null);

    addTimelineEvent({
      icon: "audit",
      title: "Audit started",
      desc: `Target: ${targetColumn} · Sensitive: ${sensitiveColumn}`,
      time: "Just now",
      color: "#eab308",
    });

    try {
      const result = await runAudit({
        project_id: projectId,
        target_column: targetColumn,
        sensitive_column: sensitiveColumn,
      });
      setAuditResult(result);

      addTimelineEvent({
        icon: "report",
        title: "Audit completed",
        desc: `Fairness ratio: ${((result.fairness_metrics.selection_rate_ratio ?? 0) * 100).toFixed(1)}% · ${result.bias_flags.length} flags`,
        time: "Just now",
        color: "#10b981",
      });

      if (result.bias_flags.some((f) => !f.includes("No strong"))) {
        addTimelineEvent({
          icon: "alert",
          title: "Bias detected",
          desc: result.bias_flags[0]?.substring(0, 80) || "See details",
          time: "Just now",
          color: "#ef4444",
        });
      }

      if (onComplete) onComplete();
    } catch (err: any) {
      setAuditError(err.message || "Audit failed");
      addTimelineEvent({
        icon: "alert",
        title: "Audit failed",
        desc: err.message || "Unknown error",
        time: "Just now",
        color: "#ef4444",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  if (!projectId || !datasetUploaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="rounded-2xl p-8 bg-white/[0.03] backdrop-blur-2xl border border-white/10 text-center">
          <Play className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 600 }} className="text-white/60">
            {!projectId ? "Upload a model first" : "Upload a dataset first"}
          </h2>
          <p style={{ fontFamily: "Inter", fontSize: 13 }} className="text-white/40 mt-2">
            Complete the upload steps before running an audit.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-2xl p-8 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 border border-white/10">
              <Play className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 600 }} className="text-white">
                Run Fairness Audit
              </h2>
              <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-white/50">
                Select columns and analyze your model for bias
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {auditResult ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 600 }} className="text-white mb-2">
                  Audit Complete!
                </h3>
                <p style={{ fontFamily: "Inter", fontSize: 13 }} className="text-white/60 mb-4">
                  Switch to Dashboard to see full results.
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                    <div style={{ fontFamily: "Inter", fontSize: 10 }} className="text-white/40 uppercase mb-1">Accuracy</div>
                    <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 20 }} className="text-blue-400">
                      {((auditResult.accuracy ?? 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                    <div style={{ fontFamily: "Inter", fontSize: 10 }} className="text-white/40 uppercase mb-1">Fairness</div>
                    <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 20 }} className="text-emerald-400">
                      {((auditResult.fairness_metrics.selection_rate_ratio ?? 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                    <div style={{ fontFamily: "Inter", fontSize: 10 }} className="text-white/40 uppercase mb-1">Flags</div>
                    <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 20 }} className="text-red-400">
                      {auditResult.bias_flags.length}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-5">
                {/* Target column select */}
                <div>
                  <label style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 500 }} className="text-white/70 block mb-2">
                    Target Column (ground truth label)
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setTargetOpen(!targetOpen); setSensitiveOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition text-left"
                    >
                      <span style={{ fontFamily: "Inter", fontSize: 13 }} className={targetColumn ? "text-white" : "text-white/40"}>
                        {targetColumn || "Select target column..."}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white/50 transition ${targetOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {targetOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute z-20 w-full mt-2 rounded-xl bg-[#0a0a18]/95 backdrop-blur-xl border border-white/10 overflow-hidden max-h-48 overflow-y-auto"
                        >
                          {datasetColumns.map((col) => (
                            <button
                              key={col}
                              onClick={() => { setTargetColumn(col); setTargetOpen(false); }}
                              className="w-full text-left px-4 py-2 hover:bg-white/5 text-white/80 transition"
                              style={{ fontFamily: "Inter", fontSize: 12 }}
                            >
                              {col}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Sensitive column select */}
                <div>
                  <label style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 500 }} className="text-white/70 block mb-2">
                    Sensitive / Protected Column
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setSensitiveOpen(!sensitiveOpen); setTargetOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition text-left"
                    >
                      <span style={{ fontFamily: "Inter", fontSize: 13 }} className={sensitiveColumn ? "text-white" : "text-white/40"}>
                        {sensitiveColumn || "Select sensitive column..."}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white/50 transition ${sensitiveOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {sensitiveOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute z-20 w-full mt-2 rounded-xl bg-[#0a0a18]/95 backdrop-blur-xl border border-white/10 overflow-hidden max-h-48 overflow-y-auto"
                        >
                          {datasetColumns
                            .filter((c) => c !== targetColumn)
                            .map((col) => (
                              <button
                                key={col}
                                onClick={() => { setSensitiveColumn(col); setSensitiveOpen(false); }}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-white/80 transition"
                                style={{ fontFamily: "Inter", fontSize: 12 }}
                              >
                                {col}
                              </button>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {auditError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-400/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-red-300">{auditError}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleRun}
                  disabled={!canRun}
                  className={`w-full py-3.5 rounded-xl text-white transition-all ${
                    canRun
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)]"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "Inter", fontSize: 14, fontWeight: 500 }}
                >
                  {isAuditing ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                      />
                      Running Fairness Audit...
                    </span>
                  ) : (
                    "🚀 Run Fairness Audit"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
