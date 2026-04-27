import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const balance = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#05060c] py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(248,113,113,0.08),transparent_60%)]" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="text-[11px] tracking-[0.4em] text-[#f87171]" style={{ fontFamily: "Inter, sans-serif" }}>
            THE PROBLEM
          </span>
          <h2
            className="mt-6 max-w-xl text-white"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.75rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Hidden bias in AI impacts{" "}
            <span className="bg-gradient-to-r from-[#f87171] to-[#a78bfa] bg-clip-text text-transparent">
              millions of decisions
            </span>{" "}
            daily.
          </h2>
          <p className="mt-6 max-w-md text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>
            From hiring algorithms to lending models — invisible asymmetries shape lives at scale. FairAI brings these patterns into the light.
          </p>
          <div className="mt-10 flex gap-8">
            {[
              { v: "73%", l: "of models exhibit bias" },
              { v: "1.2B", l: "decisions per day" },
              { v: "94%", l: "go undetected" },
            ].map((s) => (
              <div key={s.l}>
                <div
                  className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1.75rem" }}
                >
                  {s.v}
                </div>
                <div className="mt-1 text-[11px] tracking-wider text-white/40" style={{ fontFamily: "Inter, sans-serif" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative h-[460px] rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-xl"
        >
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.2),transparent_50%)]" />
          <div className="relative grid h-full grid-cols-12 grid-rows-8 gap-1.5">
            {Array.from({ length: 96 }).map((_, i) => {
              const col = i % 12;
              const row = Math.floor(i / 12);
              const isLeft = col < 6;
              return (
                <motion.div
                  key={i}
                  style={{
                    opacity: balance,
                    backgroundColor: isLeft ? "rgba(248,113,113,0.7)" : "rgba(52,211,153,0.7)",
                  }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (col + row) * 0.02, duration: 0.4 }}
                  className="rounded-sm"
                  animate={{
                    y: isLeft ? [0, -2, 0, 2, 0] : [0, 2, 0, -2, 0],
                  }}
                  // @ts-ignore
                  transition_={{ repeat: Infinity, duration: 3 + (i % 5) }}
                />
              );
            })}
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#f87171] shadow-[0_0_10px_#f87171]" />
              <span className="text-[11px] text-white/70" style={{ fontFamily: "Inter, sans-serif" }}>Biased outcomes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#34d399] shadow-[0_0_10px_#34d399]" />
              <span className="text-[11px] text-white/70" style={{ fontFamily: "Inter, sans-serif" }}>Fair outcomes</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
