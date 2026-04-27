import { motion } from "motion/react";
import { LayoutDashboard, Database, Brain, Scale, Lightbulb, FileText, Settings, ChevronLeft, Sparkles, Upload, Play } from "lucide-react";
import { useState } from "react";
import { useAudit } from "../../context/AuditContext";

const items = [
  { icon: LayoutDashboard, label: "Dashboard", section: "dashboard" },
  { icon: Upload, label: "Upload Model", section: "upload-model" },
  { icon: Database, label: "Upload Dataset", section: "upload-dataset" },
  { icon: Play, label: "Run Audit", section: "run-audit" },
  { icon: Scale, label: "Fairness Metrics", section: "fairness-metrics" },
  { icon: Lightbulb, label: "Explainability", section: "explainability" },
  { icon: FileText, label: "Reports", section: "reports" },
  { icon: Settings, label: "Settings", section: "settings" },
];

export function Sidebar({
  collapsed,
  setCollapsed,
  activePanel,
  onPanelChange,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activePanel: string;
  onPanelChange: (panel: string) => void;
}) {
  const audit = useAudit();

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="relative h-screen sticky top-0 border-r border-white/10 backdrop-blur-2xl bg-white/[0.02] z-30 flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-6">
        <motion.div className="flex items-center gap-2" animate={{ opacity: 1 }}>
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 20 }}
              className="bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent tracking-tight"
            >
              FairAI
            </motion.span>
          )}
        </motion.div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/60 hover:text-white"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = activePanel === item.section || (activePanel === "dashboard" && item.label === "Dashboard");
          const isHighlight = item.section === "upload-model" || item.section === "upload-dataset" || item.section === "run-audit";

          // Show status indicators
          let statusDot = null;
          if (item.section === "upload-model" && audit.modelUploaded) {
            statusDot = <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />;
          }
          if (item.section === "upload-dataset" && audit.datasetUploaded) {
            statusDot = <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />;
          }
          if (item.section === "run-audit" && audit.auditResult) {
            statusDot = <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />;
          }

          return (
            <motion.button
              key={item.label}
              onClick={() => onPanelChange(item.section)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 2 }}
              className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] border border-white/10"
                  : isHighlight
                  ? "text-blue-300/80 hover:text-white hover:bg-white/5"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-blue-400 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-300" : ""}`} />
              {!collapsed && (
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14 }} className="whitespace-nowrap flex-1 text-left">
                  {item.label}
                </span>
              )}
              {!collapsed && statusDot && (
                <span className="ml-auto">{statusDot}</span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-3 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-purple-500/30 blur-2xl" />
          <div className="relative">
            <div style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/60 mt-1">
              {audit.projectId ? (
                <>Project: <span className="text-blue-300 font-mono">{audit.projectId}</span></>
              ) : (
                "Upload a model to begin"
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
