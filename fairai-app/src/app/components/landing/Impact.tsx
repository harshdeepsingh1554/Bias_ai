import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";

function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, to]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const stats = [
  { val: 1000, suffix: "+", label: "Decisions Analyzed", color: "#60a5fa" },
  { val: 90, suffix: "%", label: "Bias Reduction", color: "#34d399" },
  { val: 24, suffix: "/7", label: "Real-time AI Auditing", color: "#a78bfa" },
];

export function Impact() {
  return (
    <section className="relative overflow-hidden bg-[#05060c] py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 max-w-3xl"
        >
          <span className="text-[11px] tracking-[0.4em] text-white/40" style={{ fontFamily: "Inter, sans-serif" }}>
            THE IMPACT
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
            Trusted by teams shaping{" "}
            <span className="bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#34d399] bg-clip-text text-transparent">
              the next decade of AI.
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-10 backdrop-blur-xl"
            >
              <div
                className="absolute -inset-px rounded-3xl opacity-30 blur-xl"
                style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}, transparent 70%)` }}
              />
              <div className="relative">
                <div
                  className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(3rem, 6vw, 5rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    textShadow: `0 0 40px ${s.color}40`,
                  }}
                >
                  <Counter to={s.val} suffix={s.suffix} />
                </div>
                <div
                  className="mt-4 h-px w-12"
                  style={{ background: `linear-gradient(to right, ${s.color}, transparent)` }}
                />
                <p className="mt-4 text-[13px] tracking-wider text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
