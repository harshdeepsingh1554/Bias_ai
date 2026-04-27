import { motion, useMotionValue, useTransform } from "motion/react";
import { Brain, Scale, Eye, Lightbulb } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "Bias Detection",
    desc: "Identify hidden discrimination in your models with deep statistical inspection.",
    grad: "from-[#3b82f6] to-[#22d3ee]",
    glow: "rgba(59,130,246,0.5)",
  },
  {
    icon: Scale,
    title: "Fairness Metrics",
    desc: "Measure equity across demographics using advanced statistical methods.",
    grad: "from-[#34d399] to-[#10b981]",
    glow: "rgba(52,211,153,0.5)",
  },
  {
    icon: Eye,
    title: "Explainable AI",
    desc: "Understand every decision your model makes with transparent SHAP analysis.",
    grad: "from-[#a78bfa] to-[#8b5cf6]",
    glow: "rgba(139,92,246,0.5)",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    desc: "Fix bias with actionable, prioritized insights tuned to your dataset.",
    grad: "from-[#fbbf24] to-[#f87171]",
    glow: "rgba(251,191,36,0.45)",
  },
];

function TiltCard({ feature, idx }: { feature: typeof features[number]; idx: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);
  const [hover, setHover] = useState(false);

  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: idx * 0.1 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative h-[360px] rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-8 backdrop-blur-xl transition-shadow"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${50 + (hover ? 20 : 0)}% 0%, ${feature.glow}, transparent 50%)`,
        }}
      />
      <div className="relative flex h-full flex-col" style={{ transform: "translateZ(40px)" }}>
        <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${feature.grad} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="mt-auto">
          <span className="text-[11px] tracking-[0.3em] text-white/40" style={{ fontFamily: "Inter, sans-serif" }}>
            0{idx + 1}
          </span>
          <h3
            className="mt-3 text-white"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "1.5rem", letterSpacing: "-0.02em" }}
          >
            {feature.title}
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-white/55" style={{ fontFamily: "Inter, sans-serif" }}>
            {feature.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section className="relative overflow-hidden bg-[#05060c] py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 max-w-2xl"
        >
          <span className="text-[11px] tracking-[0.4em] text-white/40" style={{ fontFamily: "Inter, sans-serif" }}>
            THE PLATFORM
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
            Engineered for{" "}
            <span className="bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#34d399] bg-clip-text text-transparent">
              responsible intelligence.
            </span>
          </h2>
        </motion.div>
        <div style={{ perspective: 1500 }} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <TiltCard key={f.title} feature={f} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
