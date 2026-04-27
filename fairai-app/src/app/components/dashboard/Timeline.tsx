import { motion } from "motion/react";
import { Database, Brain, AlertTriangle, FileCheck, GitMerge, Upload } from "lucide-react";
import { useAudit } from "../../context/AuditContext";

const iconMap: Record<string, any> = {
  upload: Upload,
  model: Brain,
  dataset: Database,
  audit: FileCheck,
  report: FileCheck,
  alert: AlertTriangle,
  fix: GitMerge,
};

const fallbackEvents = [
  { icon: Database, title: "Dataset uploaded", desc: "census_2026_v3.csv · 248k rows", time: "Just now", color: "#3b82f6" },
  { icon: Brain, title: "Model analyzed", desc: "HiringModel v3 fairness scan complete", time: "12m ago", color: "#a855f7" },
  { icon: AlertTriangle, title: "Bias detected", desc: "Gender disparity in HiringModel v3", time: "14m ago", color: "#ef4444" },
  { icon: GitMerge, title: "Mitigation applied", desc: "Reweighting strategy on LoanModel v2", time: "1h ago", color: "#06b6d4" },
  { icon: FileCheck, title: "Report generated", desc: "Q2 fairness audit · 32 pages", time: "3h ago", color: "#10b981" },
];

export function Timeline() {
  const { timeline } = useAudit();

  const events = timeline.length > 0
    ? timeline.map((e) => ({
        icon: iconMap[e.icon] || Database,
        title: e.title,
        desc: e.desc,
        time: e.time,
        color: e.color,
      }))
    : fallbackEvents;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden"
    >
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative mb-5">
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 600 }} className="text-white">
          Activity Timeline
        </h3>
        <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/50 mt-0.5">
          {timeline.length > 0 ? "Your session events" : "Demo events"}
        </p>
      </div>

      <div className="relative">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ originY: 0 }}
          className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/60 via-purple-500/40 to-transparent"
        />
        <div className="space-y-4">
          {events.map((e, i) => {
            const Icon = e.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="relative flex items-start gap-4 group"
              >
                <div
                  className="relative shrink-0 w-8 h-8 rounded-full flex items-center justify-center border z-10"
                  style={{ background: `${e.color}20`, borderColor: `${e.color}50`, boxShadow: `0 0 12px ${e.color}40` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: e.color }} />
                </div>
                <div className="flex-1 pt-0.5">
                  <div style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 500 }} className="text-white">
                    {e.title}
                  </div>
                  <div style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/50">
                    {e.desc}
                  </div>
                </div>
                <div style={{ fontFamily: "Inter", fontSize: 10 }} className="text-white/40 pt-1">
                  {e.time}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
