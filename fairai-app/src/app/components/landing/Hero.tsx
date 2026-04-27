import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { NeuralBackground } from "./NeuralBackground";
import { Link } from "react-router-dom";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(34,211,153,0.12),transparent_50%)]" />
        <NeuralBackground density={70} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05060c]" />
      </motion.div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[12px] tracking-widest text-white/80" style={{ fontFamily: "Inter, sans-serif" }}>
            REAL-TIME AI AUDITING — V2.6
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
          }}
          className="max-w-6xl text-white"
        >
          AI SHOULD BE{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#34d399] bg-clip-text text-transparent">
              FAIR.
            </span>
          </span>
          <br />
          NOT{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-[#f87171] via-[#fb7185] to-[#a78bfa] bg-clip-text text-transparent">
              BIASED.
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="absolute bottom-2 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-[#f87171] to-transparent"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 max-w-xl text-base text-white/60 md:text-lg"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Detect, analyze, and eliminate bias in machine learning systems with cinematic clarity and statistical precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/dashboard" className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#22d3ee] px-8 py-3.5 text-white shadow-[0_0_40px_rgba(99,102,241,0.45)] transition-transform hover:scale-[1.03]">
            <span className="relative z-10 flex items-center gap-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
              Start Analysis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <Link to="/dashboard" className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-white backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/10" style={{ fontFamily: "Inter, sans-serif" }}>
            <Play className="h-3.5 w-3.5" /> Explore Platform
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2 text-white/50"
          >
            <span className="text-[10px] tracking-[0.3em]" style={{ fontFamily: "Inter, sans-serif" }}>SCROLL</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
