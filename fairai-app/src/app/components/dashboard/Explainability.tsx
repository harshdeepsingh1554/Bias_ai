import { motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import { useAudit } from "../../context/AuditContext";

const demoFeatures = [
  { name: "Education Level", impact: 0.34, dir: 1 },
  { name: "Years of Experience", impact: 0.28, dir: 1 },
  { name: "Zip Code", impact: 0.21, dir: -1 },
  { name: "Age", impact: 0.18, dir: -1 },
  { name: "Gender", impact: 0.14, dir: -1 },
  { name: "Skill Score", impact: 0.12, dir: 1 },
  { name: "Prior Salary", impact: 0.09, dir: 1 },
];

export function Explainability() {
  const { auditResult } = useAudit();

  const features = auditResult?.shap_summary?.top_features
    ? auditResult.shap_summary.top_features.map((f, i) => ({
        name: f.feature,
        impact: f.importance,
        dir: i < 3 ? 1 : -1, // first features positive, rest negative (heuristic)
      }))
    : demoFeatures;

  const max = Math.max(...features.map((f) => f.impact));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden col-span-2"
    >
      <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative flex items-center gap-3 mb-1">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10">
          <Lightbulb className="w-4 h-4 text-purple-300" />
        </div>
        <div>
          <h3 style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 600 }} className="text-white">
            Why decisions are made
          </h3>
          <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/50">
            {auditResult?.shap_summary?.top_features
              ? "SHAP feature importance from your model"
              : auditResult?.shap_summary?.note
              ? auditResult.shap_summary.note
              : "Demo data — SHAP feature importance analysis"}
          </p>
        </div>
      </div>

      <div className="relative space-y-2.5 mt-5">
        {features.map((f, i) => {
          const w = (f.impact / max) * 100;
          const positive = f.dir > 0;
          return (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className="w-36 shrink-0" style={{ fontFamily: "Inter", fontSize: 12 }}>
                <span className="text-white/80">{f.name}</span>
              </div>
              <div className="flex-1 relative h-7 rounded-lg bg-white/[0.03] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${w}%` }}
                  transition={{ duration: 1.2, delay: i * 0.06, ease: "easeOut" }}
                  className="h-full rounded-lg flex items-center justify-end px-2"
                  style={{
                    background: positive
                      ? "linear-gradient(90deg, rgba(16,185,129,0.2), rgba(16,185,129,0.7))"
                      : "linear-gradient(90deg, rgba(239,68,68,0.2), rgba(239,68,68,0.7))",
                    boxShadow: positive ? "0 0 12px rgba(16,185,129,0.3)" : "0 0 12px rgba(239,68,68,0.3)",
                  }}
                >
                  <span style={{ fontFamily: "Space Grotesk", fontSize: 11, fontWeight: 600 }} className="text-white">
                    {positive ? "+" : "−"}{f.impact.toFixed(2)}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
