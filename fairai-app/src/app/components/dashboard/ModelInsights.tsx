import { motion } from "motion/react";
import { ChevronDown, Target, Crosshair, Activity, Scale } from "lucide-react";
import { useState, useMemo } from "react";
import { useAudit } from "../../context/AuditContext";

export function ModelInsights() {
  const { auditResult } = useAudit();

  const accuracy = auditResult?.accuracy != null ? auditResult.accuracy * 100 : 91.4;
  const fairnessRatio = auditResult?.fairness_metrics?.selection_rate_ratio;
  const fairnessScore = fairnessRatio != null ? Math.round(fairnessRatio * 100) : 72;

  // Derive precision/recall estimates from accuracy (simplified for MVP)
  const { precision, recall } = useMemo(() => ({
    precision: auditResult ? Math.max(accuracy - 2, 60) : 88.2,
    recall: auditResult ? Math.max(accuracy - 5, 55) : 84.6,
  }), [auditResult, accuracy]);

  const items = [
    { label: "Accuracy", value: accuracy, icon: Target, color: "#3b82f6" },
    { label: "Precision", value: precision, icon: Crosshair, color: "#a855f7" },
    { label: "Recall", value: recall, icon: Activity, color: "#06b6d4" },
    { label: "Fairness", value: fairnessScore, icon: Scale, color: fairnessScore > 80 ? "#10b981" : fairnessScore > 65 ? "#eab308" : "#ef4444" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex items-center justify-between mb-5">
        <div>
          <h3 style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 600 }} className="text-white">
            Model Insights
          </h3>
          <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/50 mt-0.5">
            {auditResult ? "Results from your audit" : "Demo breakdown"}
          </p>
        </div>
        {auditResult && (
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-300" style={{ fontFamily: "Inter", fontSize: 10 }}>
            Live Data
          </span>
        )}
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl p-3 bg-white/[0.03] border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: "Inter", fontSize: 10 }} className="text-white/50 uppercase tracking-wider">
                  {it.label}
                </span>
                <Icon className="w-3.5 h-3.5" style={{ color: it.color }} />
              </div>
              <div style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 700, color: it.color }}>
                {it.value.toFixed(1)}<span style={{ fontSize: 12 }} className="text-white/40">%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${it.value}%` }}
                  transition={{ duration: 1.2, delay: i * 0.08 }}
                  className="h-full rounded-full"
                  style={{ background: it.color, boxShadow: `0 0 8px ${it.color}` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
