import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { useState } from "react";
import { useAudit } from "../../context/AuditContext";

function GlassPanel({ children, className = "" }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative rounded-2xl p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Fallback data for when no audit has been run
const fallbackLineData = [
  { name: "Jan", a: 62, b: 58 },
  { name: "Feb", a: 68, b: 60 },
  { name: "Mar", a: 65, b: 64 },
  { name: "Apr", a: 72, b: 67 },
  { name: "May", a: 78, b: 70 },
  { name: "Jun", a: 75, b: 72 },
  { name: "Jul", a: 82, b: 76 },
  { name: "Aug", a: 85, b: 79 },
];

export function FairnessLineChart() {
  const { auditResult } = useAudit();
  const [compare, setCompare] = useState(true);

  // When we have audit data, generate a single data point showing current vs baseline
  const lineData = auditResult
    ? [
        ...fallbackLineData.slice(0, -1),
        {
          name: "Now",
          a: Math.round((auditResult.fairness_metrics.selection_rate_ratio ?? 0.82) * 100),
          b: fallbackLineData[fallbackLineData.length - 2].b,
        },
      ]
    : fallbackLineData;

  return (
    <GlassPanel className="col-span-2">
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 600 }} className="text-white">
            Fairness Score Over Time
          </h3>
          <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/50 mt-0.5">
            {auditResult ? "Live data from your latest audit" : "Demo data — run an audit to see real results"}
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/60">Compare models</span>
          <button
            onClick={() => setCompare(!compare)}
            className={`relative w-9 h-5 rounded-full transition ${compare ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]" : "bg-white/10"}`}
          >
            <motion.div
              animate={{ x: compare ? 18 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
            />
          </button>
        </label>
      </div>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "rgba(15,15,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, backdropFilter: "blur(20px)", fontFamily: "Inter", fontSize: 12 }}
              labelStyle={{ color: "white" }}
            />
            <Area type="monotone" dataKey="a" stroke="#3b82f6" strokeWidth={2.5} fill="url(#g1)" animationDuration={1800} dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5, fill: "#3b82f6", stroke: "white" }} />
            {compare && (
              <Area type="monotone" dataKey="b" stroke="#a855f7" strokeWidth={2.5} fill="url(#g2)" animationDuration={1800} dot={{ fill: "#a855f7", r: 3 }} activeDot={{ r: 5, fill: "#a855f7", stroke: "white" }} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="relative flex gap-4 mt-2">
        <Legend color="#3b82f6" label={auditResult ? "Current Audit" : "Hiring Model v3"} />
        {compare && <Legend color="#a855f7" label="Previous Baseline" />}
      </div>
    </GlassPanel>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/60">{label}</span>
    </div>
  );
}

export function BiasBarChart() {
  const { auditResult } = useAudit();

  // Build bar data from real audit group metrics or fallback
  const barData = auditResult && auditResult.fairness_metrics.by_group
    ? Object.entries(auditResult.fairness_metrics.by_group).map(([group, metrics]) => ({
        group,
        value: Math.round((metrics.selection_rate ?? 0) * 100),
        fair: 90,
      }))
    : [
        { group: "Male", value: 88, fair: 90 },
        { group: "Female", value: 71, fair: 90 },
        { group: "18-30", value: 84, fair: 90 },
        { group: "31-50", value: 79, fair: 90 },
        { group: "50+", value: 62, fair: 90 },
        { group: "Low Inc.", value: 58, fair: 90 },
        { group: "High Inc.", value: 91, fair: 90 },
      ];

  return (
    <GlassPanel>
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="relative mb-4">
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 600 }} className="text-white">
          Bias Comparison Across Groups
        </h3>
        <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/50 mt-0.5">
          {auditResult ? "Selection rates from your audit" : "Demo data — approval rates across attributes"}
        </p>
      </div>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <XAxis dataKey="group" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 10, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{ background: "rgba(15,15,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontFamily: "Inter", fontSize: 12 }}
            />
            <Bar dataKey="value" fill="url(#bar1)" radius={[6, 6, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}
