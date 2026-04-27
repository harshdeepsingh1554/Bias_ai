import { motion } from "motion/react";
import { Upload, Cpu, AlertTriangle, FileCheck } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload Dataset", desc: "Securely connect your data source.", color: "#60a5fa" },
  { icon: Cpu, title: "Train / Analyze Model", desc: "Run inference across cohorts.", color: "#a78bfa" },
  { icon: AlertTriangle, title: "Detect Bias", desc: "Identify statistical asymmetry.", color: "#f87171" },
  { icon: FileCheck, title: "Get Fairness Report", desc: "Receive auditable insights.", color: "#34d399" },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#05060c] py-32">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(139,92,246,0.05),transparent)]" />
      <div className="mx-auto max-w-7xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <span className="text-[11px] tracking-[0.4em] text-white/40" style={{ fontFamily: "Inter, sans-serif" }}>
            HOW IT WORKS
          </span>
          <h2
            className="mt-4 text-white"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Four steps to{" "}
            <span className="bg-gradient-to-r from-[#60a5fa] to-[#34d399] bg-clip-text text-transparent">
              auditable AI.
            </span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-[60px] hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 mx-auto grid h-[120px] w-[120px] place-items-center">
                    <div
                      className="absolute inset-0 rounded-full opacity-30 blur-2xl"
                      style={{ backgroundColor: s.color }}
                    />
                    <div
                      className="relative grid h-[120px] w-[120px] place-items-center rounded-full border border-white/15 bg-black/60 backdrop-blur-xl"
                      style={{ boxShadow: `inset 0 0 30px ${s.color}33` }}
                    >
                      <Icon className="h-8 w-8" style={{ color: s.color }} />
                      <span
                        className="absolute -top-2 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white text-[11px] text-black"
                        style={{ fontFamily: "Space Grotesk", fontWeight: 700 }}
                      >
                        {i + 1}
                      </span>
                    </div>
                  </div>
                  <h3
                    className="mt-6 text-white"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "1.15rem" }}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>
                    {s.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
