import { motion } from "motion/react";
import { TrendingUp, AlertCircle, Activity, BarChart3 } from "lucide-react";

export function Dashboard() {
  const bars = [62, 78, 45, 90, 71, 55, 83, 67, 49, 88];
  return (
    <section className="relative overflow-hidden bg-[#05060c] py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div className="max-w-xl">
            <span className="text-[11px] tracking-[0.4em] text-white/40" style={{ fontFamily: "Inter, sans-serif" }}>
              THE DASHBOARD
            </span>
            <h2
              className="mt-4 text-white"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Cinematic clarity. <br />
              <span className="bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] bg-clip-text text-transparent">
                Statistical truth.
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>
            A control surface designed for data scientists, auditors, and policy teams alike.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-2 backdrop-blur-xl shadow-[0_0_80px_rgba(99,102,241,0.15)]"
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-[#3b82f6]/30 via-[#8b5cf6]/30 to-[#22d3ee]/30 opacity-50 blur-xl" />
          <div className="relative rounded-[20px] bg-[#0a0b14] p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
                </div>
                <span className="ml-3 text-[12px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>
                  fairai.app / models / credit-risk-v3
                </span>
              </div>
              <span className="text-[11px] tracking-wider text-emerald-400">● LIVE</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#1e293b]/50 to-transparent p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>Fairness Score</span>
                  <Activity className="h-4 w-4 text-[#34d399]" />
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span
                    className="bg-gradient-to-r from-[#34d399] to-[#60a5fa] bg-clip-text text-transparent"
                    style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "3rem", lineHeight: 1 }}
                  >
                    92.4
                  </span>
                  <span className="mb-2 text-[12px] text-white/40">/100</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "92.4%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#34d399] to-[#60a5fa]"
                  />
                </div>
                <p className="mt-3 text-[11px] text-white/40" style={{ fontFamily: "Inter, sans-serif" }}>
                  +6.2 since last audit
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#7f1d1d]/20 to-transparent p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>Bias Alerts</span>
                  <AlertCircle className="h-4 w-4 text-[#f87171]" />
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Gender disparity", val: "Critical", c: "#f87171" },
                    { label: "Age skew", val: "Moderate", c: "#fbbf24" },
                    { label: "Geo bias", val: "Low", c: "#34d399" },
                  ].map((a, i) => (
                    <motion.div
                      key={a.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-2"
                    >
                      <span className="text-[12px] text-white/70" style={{ fontFamily: "Inter, sans-serif" }}>{a.label}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px]"
                        style={{ backgroundColor: `${a.c}20`, color: a.c, fontFamily: "Inter, sans-serif" }}
                      >
                        {a.val}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#312e81]/30 to-transparent p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>SHAP Distribution</span>
                  <BarChart3 className="h-4 w-4 text-[#a78bfa]" />
                </div>
                <div className="mt-4 flex h-[110px] items-end gap-1.5">
                  {bars.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="flex-1 rounded-t bg-gradient-to-t from-[#8b5cf6] to-[#a78bfa] shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-white/30" style={{ fontFamily: "Inter, sans-serif" }}>
                  <span>income</span><span>age</span><span>region</span><span>gender</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>Demographic Parity</span>
                  <TrendingUp className="h-4 w-4 text-[#60a5fa]" />
                </div>
                <svg viewBox="0 0 400 100" className="mt-3 h-[100px] w-full">
                  <defs>
                    <linearGradient id="lg" x1="0" x2="1">
                      <stop offset="0" stopColor="#60a5fa" />
                      <stop offset="1" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="lgFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#60a5fa" stopOpacity="0.3" />
                      <stop offset="1" stopColor="#60a5fa" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2 }}
                    d="M0,70 Q50,40 100,55 T200,30 T300,45 T400,20"
                    stroke="url(#lg)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path d="M0,70 Q50,40 100,55 T200,30 T300,45 T400,20 L400,100 L0,100 Z" fill="url(#lgFill)" />
                </svg>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                <span className="text-[12px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>Recommendations</span>
                <div className="mt-3 space-y-2">
                  {["Rebalance training distribution by region", "Apply equalized odds post-processing", "Re-weight underrepresented cohort"].map((r, i) => (
                    <motion.div
                      key={r}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-center gap-2 text-[12px] text-white/70"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_6px_#a78bfa]" />
                      {r}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
