import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#05060c] py-40">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b82f6] opacity-20 blur-[120px]" />
        <div className="absolute left-[30%] top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#8b5cf6] opacity-25 blur-[100px]" />
        <div className="absolute right-[25%] top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#34d399] opacity-15 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative mx-auto max-w-5xl px-8 text-center"
      >
        <h2
          className="text-white"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
          }}
        >
          Build{" "}
          <span className="bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#34d399] bg-clip-text text-transparent">
            Responsible AI
          </span>
          <br />
          Today.
        </h2>
        <p className="mx-auto mt-8 max-w-lg text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>
          Join the teams setting the new standard for fairness in machine learning.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="group relative mt-12 overflow-hidden rounded-full bg-white px-10 py-4 text-black shadow-[0_0_60px_rgba(255,255,255,0.3)]"
        >
          <span className="relative z-10 flex items-center gap-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
}
