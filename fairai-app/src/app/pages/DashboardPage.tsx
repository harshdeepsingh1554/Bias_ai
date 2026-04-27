import { useState } from "react";
import { motion } from "motion/react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Topbar } from "../components/dashboard/Topbar";
import { KpiCards } from "../components/dashboard/KpiCards";
import { FairnessLineChart, BiasBarChart } from "../components/dashboard/Charts";
import { BiasAlerts } from "../components/dashboard/BiasAlerts";
import { Heatmap } from "../components/dashboard/Heatmap";
import { ModelInsights } from "../components/dashboard/ModelInsights";
import { Explainability } from "../components/dashboard/Explainability";
import { Timeline } from "../components/dashboard/Timeline";
import { UploadModelPanel } from "../components/dashboard/UploadModelPanel";
import { UploadDatasetPanel } from "../components/dashboard/UploadDatasetPanel";
import { RunAuditPanel } from "../components/dashboard/RunAuditPanel";

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState("dashboard");

  const renderPanel = () => {
    switch (activePanel) {
      case "upload-model":
        return <UploadModelPanel />;
      case "upload-dataset":
        return <UploadDatasetPanel />;
      case "run-audit":
        return <RunAuditPanel onComplete={() => setActivePanel("dashboard")} />;
      case "dashboard":
      case "fairness-metrics":
      case "explainability":
      case "reports":
      case "settings":
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ fontFamily: "Inter, sans-serif", background: "radial-gradient(ellipse at top left, #0b1029 0%, #050714 40%, #02030a 100%)" }}>
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative flex">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        <div className="flex-1 min-w-0">
          <Topbar />

          <main className="p-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end justify-between flex-wrap gap-4"
            >
              <div>
                <h1
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: -0.5 }}
                  className="bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent"
                >
                  {activePanel === "upload-model"
                    ? "Upload Model"
                    : activePanel === "upload-dataset"
                    ? "Upload Dataset"
                    : activePanel === "run-audit"
                    ? "Run Audit"
                    : "AI Fairness Control Center"}
                </h1>
                <p style={{ fontFamily: "Inter", fontSize: 14 }} className="text-white/50 mt-1">
                  {activePanel === "dashboard"
                    ? "Real-time insights into model bias and fairness"
                    : "Complete the steps below to analyze your model"}
                </p>
              </div>
              {activePanel === "dashboard" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePanel("upload-model")}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80"
                    style={{ fontSize: 12, fontFamily: "Inter" }}
                  >
                    Upload Model
                  </button>
                  <button
                    onClick={() => setActivePanel("run-audit")}
                    className="px-4 py-2 rounded-xl text-white shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] transition"
                    style={{ background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", fontSize: 12, fontFamily: "Inter", fontWeight: 500 }}
                  >
                    Run New Analysis
                  </button>
                </div>
              )}
            </motion.div>

            {renderPanel()}
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  return (
    <>
      <KpiCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <FairnessLineChart />
        <BiasBarChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <Heatmap />
        </div>
        <BiasAlerts />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Explainability />
        <ModelInsights />
      </div>

      <Timeline />

      <div className="text-center pt-4 pb-6" style={{ fontFamily: "Inter", fontSize: 11 }}>
        <span className="text-white/30">FairAI © 2026 · Building trustworthy AI, one model at a time.</span>
      </div>
    </>
  );
}
