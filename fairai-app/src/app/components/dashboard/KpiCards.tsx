import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Brain, Database } from "lucide-react";
import { useAudit } from "../../context/AuditContext";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [val, setVal] = useState(0);
  useEffect(() => {
    const c = animate(count, to, { duration: 1.6, ease: "easeOut" });
    const u = rounded.on("change", (v) => setVal(v));
    return () => { c.stop(); u(); };
  }, [to]);
  return <span>{val}{suffix}</span>;
}

function CircularProgress({ value }: { value: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const color = value > 75 ? "#10b981" : value > 50 ? "#eab308" : "#ef4444";
  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <motion.circle
          cx="40" cy="40" r={r} stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, color: "white" }}>
        <CountUp to={value} suffix="%" />
      </div>
    </div>
  );
}

export function KpiCards() {
  const { auditResult, modelUploaded, datasetUploaded } = useAudit();

  // Derive KPI values from real audit data when available
  const fairnessScore = auditResult
    ? Math.round((auditResult.fairness_metrics.selection_rate_ratio ?? 0) * 100)
    : 82;

  const biasRisk = auditResult
    ? (auditResult.bias_flags.length > 1 && !auditResult.bias_flags[0]?.includes("No strong"))
      ? "HIGH"
      : "LOW"
    : "—";

  const biasColor = biasRisk === "HIGH" ? "text-red-300" : biasRisk === "LOW" ? "text-emerald-300" : "text-white/40";
  const biasAlertCount = auditResult ? auditResult.bias_flags.filter(f => !f.includes("No strong")).length : 0;

  const modelsAnalyzed = auditResult ? 1 : 0;
  const datasetsProcessed = datasetUploaded ? 1 : 0;

  const cards = [
    {
      title: "Fairness Score",
      icon: Activity,
      glow: "rgba(16,185,129,0.3)",
      content: <CircularProgress value={fairnessScore} />,
      sub: auditResult ? `Accuracy: ${((auditResult.accuracy ?? 0) * 100).toFixed(1)}%` : "Run audit to see score",
      subColor: auditResult ? "text-emerald-400" : "text-white/40",
    },
    {
      title: "Bias Risk Level",
      icon: AlertTriangle,
      glow: biasRisk === "HIGH" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)",
      content: (
        <div className="flex flex-col items-start gap-2 py-2">
          <div className="relative inline-flex">
            <span className={`px-3 py-1 rounded-full ${biasRisk === "HIGH" ? "bg-red-500/20 border border-red-400/40 text-red-300" : biasRisk === "LOW" ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300" : "bg-white/5 border border-white/10 text-white/40"}`} style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 13 }}>
              {biasRisk}
            </span>
            {biasRisk === "HIGH" && <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />}
          </div>
          <div className="text-white/40" style={{ fontFamily: "Inter", fontSize: 11 }}>
            {biasAlertCount > 0 ? `${biasAlertCount} alert${biasAlertCount > 1 ? "s" : ""} found` : "No alerts"}
          </div>
        </div>
      ),
      sub: biasRisk === "HIGH" ? "Action required" : "Looking good",
      subColor: biasRisk === "HIGH" ? "text-red-400" : "text-emerald-400",
    },
    {
      title: "Models Analyzed",
      icon: Brain,
      glow: "rgba(139,92,246,0.3)",
      content: (
        <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 36 }} className="text-white bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
          <CountUp to={modelsAnalyzed} />
        </div>
      ),
      sub: modelUploaded ? "Model uploaded ✓" : "Upload a model",
      subColor: modelUploaded ? "text-purple-400" : "text-white/40",
    },
    {
      title: "Datasets Processed",
      icon: Database,
      glow: "rgba(59,130,246,0.3)",
      content: (
        <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 36 }} className="text-white bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
          <CountUp to={datasetsProcessed} />
        </div>
      ),
      sub: datasetUploaded ? "Dataset ready ✓" : "Upload a dataset",
      subColor: datasetUploaded ? "text-blue-400" : "text-white/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="group relative rounded-2xl p-5 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden transition-all hover:border-white/20"
            style={{ boxShadow: `0 8px 30px rgba(0,0,0,0.4)` }}
          >
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-50 group-hover:opacity-90 transition"
              style={{ background: c.glow }}
            />
            <div className="relative flex items-start justify-between mb-4">
              <div>
                <div style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 500 }} className="text-white/50 uppercase tracking-wider">
                  {c.title}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Icon className="w-4 h-4 text-white/70" />
              </div>
            </div>
            <div className="relative min-h-[80px] flex items-center">{c.content}</div>
            <div className={`relative mt-3 ${c.subColor}`} style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 500 }}>
              {c.sub}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
