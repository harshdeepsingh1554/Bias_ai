import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ChevronDown, Zap } from "lucide-react";
import { useState } from "react";
import { useAudit } from "../../context/AuditContext";

const demoAlerts = [
  {
    id: 1,
    title: "Gender bias detected in hiring model",
    severity: "Critical",
    color: "#ef4444",
    detail: "Female candidates show 17% lower selection rate in HiringModel v3 despite equivalent qualifications.",
    model: "HiringModel v3",
    time: "2m ago",
  },
  {
    id: 2,
    title: "Income disparity in loan approval",
    severity: "High",
    color: "#f97316",
    detail: "LoanModel v2 demonstrates 23% higher rejection rate for applicants in lower income brackets.",
    model: "LoanModel v2",
    time: "14m ago",
  },
];

export function BiasAlerts() {
  const [open, setOpen] = useState<number | null>(1);
  const { auditResult } = useAudit();

  const alerts = auditResult
    ? auditResult.bias_flags
        .filter((f) => !f.includes("No strong"))
        .map((flag, i) => ({
          id: i + 1,
          title: flag.split(",")[0] || flag.substring(0, 60),
          severity: flag.includes("gap") ? "Critical" : "High",
          color: flag.includes("gap") ? "#ef4444" : "#f97316",
          detail: flag,
          model: `Project ${auditResult.project_id}`,
          time: "Just now",
        }))
    : demoAlerts;

  const hasRealAlerts = auditResult && alerts.length > 0;

  if (!hasRealAlerts && auditResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl p-6 bg-gradient-to-br from-emerald-500/[0.06] to-cyan-500/[0.04] backdrop-blur-2xl border border-emerald-400/20 overflow-hidden"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 600 }} className="text-white">
              All Clear!
            </h3>
            <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-emerald-300/70 mt-0.5">
              No fairness violations detected in your model.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl p-6 bg-gradient-to-br from-red-500/[0.06] to-orange-500/[0.04] backdrop-blur-2xl border border-red-400/20 overflow-hidden"
      style={{ boxShadow: "0 0 40px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-red-500/20 blur-3xl"
      />
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-red-500/20 border border-red-400/30">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <div className="absolute inset-0 rounded-xl bg-red-500/30 animate-ping" />
          </div>
          <div>
            <h3 style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 600 }} className="text-white">
              Bias Alerts
            </h3>
            <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/50">
              {auditResult ? "From your audit results" : "Demo alerts"} · {alerts.length} active
            </p>
          </div>
        </div>
      </div>

      <div className="relative space-y-3">
        {alerts.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="rounded-xl border backdrop-blur-xl overflow-hidden"
            style={{ background: `linear-gradient(90deg, ${a.color}15, transparent)`, borderColor: `${a.color}30` }}
          >
            <button
              onClick={() => setOpen(open === a.id ? null : a.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition text-left"
            >
              <div className="w-1 h-10 rounded-full" style={{ background: a.color, boxShadow: `0 0 10px ${a.color}` }} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 500 }} className="text-white">
                    {a.title}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded-md"
                    style={{ background: `${a.color}25`, color: a.color, fontSize: 9, fontFamily: "Inter", fontWeight: 600, letterSpacing: 0.5 }}
                  >
                    {a.severity.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/40">
                  {a.model} · {a.time}
                </div>
              </div>
              <motion.div animate={{ rotate: open === a.id ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </motion.div>
            </button>
            <AnimatePresence>
              {open === a.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pl-7" style={{ fontFamily: "Inter", fontSize: 12 }}>
                    <p className="text-white/70 leading-relaxed">{a.detail}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
