import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import {
  Brain, AlertTriangle, Search, Wrench, ShieldAlert,
  ChevronDown, TrendingDown, TrendingUp, Gauge,
  Database, Settings, Layers, CheckCircle, XCircle, Info
} from "lucide-react";
import { useAudit } from "../../context/AuditContext";
import { generateInsights, type AllInsights, type Severity } from "./generateInsights";

/* ── Shared helpers ─────────────────────────────────────────── */

function GlassCard({ children, className = "", glow }: { children: React.ReactNode; className?: string; glow?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden ${className}`}
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
    >
      {glow && <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-40" style={{ background: glow }} />}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, color, badge, open, onToggle }: {
  icon: any; title: string; subtitle: string; color: string; badge?: string; open: boolean; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-3 text-left group">
      <div className="p-2.5 rounded-xl border border-white/10" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 style={{ fontFamily: "Space Grotesk", fontSize: 17, fontWeight: 600 }} className="text-white">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-white/50 mt-0.5">{subtitle}</p>
      </div>
      <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
        <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white/70 transition" />
      </motion.div>
    </button>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, { bg: string; text: string; border: string }> = {
    Low: { bg: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
    Moderate: { bg: "rgba(234,179,8,0.15)", text: "#fbbf24", border: "rgba(234,179,8,0.3)" },
    High: { bg: "rgba(249,115,22,0.15)", text: "#fb923c", border: "rgba(249,115,22,0.3)" },
    Critical: { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.3)" },
  };
  const s = map[severity];
  return (
    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {severity}
    </span>
  );
}

/* ── Section 1: Summary ─────────────────────────────────────── */

function SummarySection({ insights }: { insights: AllInsights }) {
  const s = insights.summary;
  const borderColor = s.severity === "Low" ? "border-emerald-400/30" : s.severity === "Moderate" ? "border-yellow-400/30" : s.severity === "High" ? "border-orange-400/30" : "border-red-400/30";
  const gradFrom = s.severity === "Low" ? "from-emerald-500/10" : s.severity === "Moderate" ? "from-yellow-500/10" : s.severity === "High" ? "from-orange-500/10" : "from-red-500/10";

  return (
    <div className={`rounded-xl p-5 bg-gradient-to-r ${gradFrom} to-transparent border ${borderColor}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5"><SeverityBadge severity={s.severity} /></div>
        <div>
          <div style={{ fontFamily: "Space Grotesk", fontSize: 15, fontWeight: 600 }} className="text-white mb-1.5">{s.headline}</div>
          <p style={{ fontFamily: "Inter", fontSize: 13, lineHeight: 1.7 }} className="text-white/70">{s.body}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Section 2: Fairness Interpretation ─────────────────────── */

function FairnessSection({ insights }: { insights: AllInsights }) {
  const fi = insights.fairnessInterpretation;
  const color = fi.verdict === "good" ? "#10b981" : fi.verdict === "warning" ? "#eab308" : "#ef4444";
  const r = 44, c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90">
            <circle cx="56" cy="56" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="7" fill="none" />
            <motion.circle cx="56" cy="56" r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
              strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (c * fi.score) / 100 }}
              transition={{ duration: 1.8, ease: "easeOut" }} style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 24, color: "white" }}>{fi.score}%</span>
            <span style={{ fontFamily: "Inter", fontSize: 10, color }}>{fi.label}</span>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <p style={{ fontFamily: "Inter", fontSize: 13, lineHeight: 1.8 }} className="text-white/70">{fi.explanation}</p>
        <div className="mt-3 flex gap-3">
          <MiniStat label="Score" value={`${fi.score}%`} color={color} />
          <MiniStat label="Verdict" value={fi.label} color={color} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10">
      <div style={{ fontFamily: "Inter", fontSize: 10 }} className="text-white/40 uppercase tracking-wider mb-0.5">{label}</div>
      <div style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

/* ── Section 3: Key Bias Findings ───────────────────────────── */

function BiasSection({ insights }: { insights: AllInsights }) {
  const kbf = insights.keyBiasFindings;

  return (
    <div className="space-y-5">
      {/* Group table */}
      {kbf.mostAffectedGroups.length > 0 && (
        <div>
          <div style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 500 }} className="text-white/60 mb-3">Affected Groups</div>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-4 py-2.5 bg-white/[0.03] border-b border-white/5">
              {["Group", "Selection Rate", "Accuracy", "Count"].map(h => (
                <div key={h} style={{ fontFamily: "Inter", fontSize: 10, fontWeight: 600 }} className="text-white/40 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            {kbf.mostAffectedGroups.map((g, i) => {
              const isLow = g.selectionRate < 60;
              return (
                <motion.div key={g.group} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`grid grid-cols-4 gap-2 px-4 py-3 border-b border-white/5 last:border-0 ${isLow ? "bg-red-500/[0.04]" : ""}`}>
                  <div style={{ fontFamily: "Inter", fontSize: 13 }} className="text-white/90 font-medium">{g.group}</div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: 600 }} className={isLow ? "text-red-400" : "text-emerald-400"}>{g.selectionRate}%</span>
                    {isLow ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> : <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div style={{ fontFamily: "Space Grotesk", fontSize: 13 }} className="text-white/70">{g.accuracy != null ? `${g.accuracy}%` : "—"}</div>
                  <div style={{ fontFamily: "Inter", fontSize: 12 }} className="text-white/50">{g.count.toLocaleString()}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Triggered metrics */}
      {kbf.triggeredMetrics.length > 0 && (
        <div>
          <div style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 500 }} className="text-white/60 mb-3">Triggered Metrics</div>
          <div className="space-y-2.5">
            {kbf.triggeredMetrics.map((m, i) => (
              <motion.div key={m.metric} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-xl p-4 bg-white/[0.02] border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: 600 }} className="text-white">{m.metric}</span>
                  <SeverityBadge severity={m.severity} />
                  <span style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: 700 }} className="ml-auto text-white/80">{(Math.abs(m.value) * 100).toFixed(1)}%</span>
                </div>
                <p style={{ fontFamily: "Inter", fontSize: 12, lineHeight: 1.7 }} className="text-white/55">{m.explanation}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {kbf.triggeredMetrics.length === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-400/20">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p style={{ fontFamily: "Inter", fontSize: 13 }} className="text-emerald-300/80">No fairness metrics exceeded alert thresholds.</p>
        </div>
      )}
    </div>
  );
}

/* ── Section 4: Why This Is Happening ───────────────────────── */

function WhySection({ insights }: { insights: AllInsights }) {
  const wh = insights.whyHappening;
  const max = Math.max(...wh.topFeatures.map(f => f.importance), 0.01);

  return (
    <div className="space-y-5">
      <p style={{ fontFamily: "Inter", fontSize: 13, lineHeight: 1.8 }} className="text-white/70">{wh.explanation}</p>
      {wh.topFeatures.length > 0 && (
        <div className="space-y-2">
          {wh.topFeatures.map((f, i) => {
            const w = (f.importance / max) * 100;
            const isProxy = f.proxyFor != null;
            return (
              <motion.div key={f.feature} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-3 ${isProxy ? "bg-red-500/[0.04] border border-red-400/15" : "bg-white/[0.02] border border-white/8"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 500 }} className="text-white/90 w-40 shrink-0">{f.feature}</span>
                  <div className="flex-1 h-6 rounded-lg bg-white/[0.03] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                      className="h-full rounded-lg flex items-center justify-end px-2"
                      style={{ background: isProxy ? "linear-gradient(90deg, rgba(239,68,68,0.2), rgba(239,68,68,0.65))" : "linear-gradient(90deg, rgba(99,102,241,0.2), rgba(99,102,241,0.65))", boxShadow: isProxy ? "0 0 10px rgba(239,68,68,0.2)" : "0 0 10px rgba(99,102,241,0.2)" }}>
                      <span style={{ fontFamily: "Space Grotesk", fontSize: 10, fontWeight: 600 }} className="text-white">{f.importance.toFixed(3)}</span>
                    </motion.div>
                  </div>
                  {isProxy && (
                    <span className="px-2 py-0.5 rounded-md bg-red-500/15 border border-red-400/25 text-red-400 text-[9px] font-bold uppercase tracking-wider shrink-0">Proxy</span>
                  )}
                </div>
                {isProxy && (
                  <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-red-300/70 ml-[172px]">⚠ May proxy for {f.proxyFor}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Section 5: Recommendations ─────────────────────────────── */

function RecommendationsSection({ insights }: { insights: AllInsights }) {
  const catIcon: Record<string, any> = { data: Database, model: Settings, feature: Layers };
  const catColor: Record<string, string> = { data: "#3b82f6", model: "#a855f7", feature: "#06b6d4" };
  const catLabel: Record<string, string> = { data: "Data-Level", model: "Model-Level", feature: "Feature-Level" };
  const prioColor: Record<string, string> = { high: "#ef4444", medium: "#eab308", low: "#10b981" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {insights.recommendations.map((rec, i) => {
        const Icon = catIcon[rec.category] || Wrench;
        const color = catColor[rec.category] || "#8b5cf6";
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className="rounded-xl p-4 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all group">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg border border-white/10 shrink-0" style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontFamily: "Inter", fontSize: 10, fontWeight: 600, color }} className="uppercase tracking-wider">
                    {catLabel[rec.category]}
                  </span>
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ color: prioColor[rec.priority], background: `${prioColor[rec.priority]}15` }}>
                    {rec.priority}
                  </span>
                </div>
                <div style={{ fontFamily: "Space Grotesk", fontSize: 14, fontWeight: 600 }} className="text-white mb-1.5">
                  {rec.icon} {rec.title}
                </div>
                <p style={{ fontFamily: "Inter", fontSize: 12, lineHeight: 1.7 }} className="text-white/55">{rec.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Section 6: Risk Statement ──────────────────────────────── */

function RiskSection({ insights }: { insights: AllInsights }) {
  const rs = insights.riskStatement;
  const color = rs.severity === "Critical" ? "#ef4444" : rs.severity === "High" ? "#f97316" : rs.severity === "Moderate" ? "#eab308" : "#10b981";
  const bgGrad = rs.severity === "Low" ? "from-emerald-500/[0.06]" : rs.severity === "Moderate" ? "from-yellow-500/[0.06]" : "from-red-500/[0.06]";

  return (
    <div className={`rounded-xl p-5 bg-gradient-to-br ${bgGrad} to-transparent border`} style={{ borderColor: `${color}30` }}>
      <div className="flex items-start gap-3 mb-4">
        <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" style={{ color }} />
        <p style={{ fontFamily: "Inter", fontSize: 13, lineHeight: 1.8 }} className="text-white/80">{rs.statement}</p>
      </div>
      {rs.impacts.length > 0 && (
        <div className="ml-9 space-y-2">
          {rs.impacts.map((imp, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-start gap-2">
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
              <span style={{ fontFamily: "Inter", fontSize: 12, lineHeight: 1.6 }} className="text-white/60">{imp}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Panel ─────────────────────────────────────────────── */

export function AiInsightsPanel() {
  const { auditResult } = useAudit();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    summary: true, fairness: true, bias: true, why: true, recs: true, risk: true,
  });

  const toggle = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const insights = useMemo(() => (auditResult ? generateInsights(auditResult) : null), [auditResult]);

  if (!insights) {
    return (
      <GlassCard className="text-center py-12" glow="rgba(99,102,241,0.15)">
        <Brain className="w-14 h-14 text-white/15 mx-auto mb-4" />
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 600 }} className="text-white/50 mb-2">
          AI Fairness Assistant
        </h3>
        <p style={{ fontFamily: "Inter", fontSize: 13 }} className="text-white/35 max-w-md mx-auto">
          Run a fairness audit to unlock AI-powered insights, bias analysis, recommendations, and risk assessments.
        </p>
      </GlassCard>
    );
  }

  const sections = [
    { key: "summary", icon: Brain, title: "Summary", subtitle: "Overall model condition at a glance", color: "#8b5cf6", badge: insights.summary.severity, content: <SummarySection insights={insights} /> },
    { key: "fairness", icon: Gauge, title: "Fairness Interpretation", subtitle: "What the fairness score means", color: insights.fairnessInterpretation.verdict === "good" ? "#10b981" : insights.fairnessInterpretation.verdict === "warning" ? "#eab308" : "#ef4444", content: <FairnessSection insights={insights} /> },
    { key: "bias", icon: AlertTriangle, title: "Key Bias Findings", subtitle: "Most affected groups and triggered metrics", color: "#f97316", badge: `${insights.keyBiasFindings.triggeredMetrics.length} alerts`, content: <BiasSection insights={insights} /> },
    { key: "why", icon: Search, title: "Why This Is Happening", subtitle: "Feature importance and proxy variable analysis", color: "#3b82f6", content: <WhySection insights={insights} /> },
    { key: "recs", icon: Wrench, title: "Recommended Actions", subtitle: "Specific fixes to reduce bias", color: "#06b6d4", badge: `${insights.recommendations.length} actions`, content: <RecommendationsSection insights={insights} /> },
    { key: "risk", icon: ShieldAlert, title: "Risk Statement", subtitle: "Real-world impact assessment", color: insights.riskStatement.severity === "Low" ? "#10b981" : "#ef4444", content: <RiskSection insights={insights} /> },
  ];

  return (
    <div className="space-y-4">
      {/* AI Assistant header */}
      <GlassCard glow="rgba(139,92,246,0.12)">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Brain className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h2 style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 700 }} className="text-white bg-gradient-to-r from-white via-purple-200 to-blue-300 bg-clip-text text-transparent">
              AI Fairness Assistant
            </h2>
            <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-white/50">
              Intelligent analysis of your model's fairness profile
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/20">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            </div>
            <span style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 500 }} className="text-purple-300">Analysis Complete</span>
          </div>
        </div>
      </GlassCard>

      {/* Sections */}
      {sections.map((sec, i) => (
        <motion.div key={sec.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.5 }}>
          <GlassCard>
            <SectionHeader icon={sec.icon} title={sec.title} subtitle={sec.subtitle} color={sec.color} badge={sec.badge} open={!!openSections[sec.key]} onToggle={() => toggle(sec.key)} />
            <AnimatePresence>
              {openSections[sec.key] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                  className="overflow-hidden">
                  <div className="pt-5 border-t border-white/5 mt-4">{sec.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
