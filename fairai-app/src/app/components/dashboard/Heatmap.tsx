import { motion } from "motion/react";
import { useAudit } from "../../context/AuditContext";

const defaultRows = ["Gender", "Age", "Income", "Ethnicity", "Region"];
const defaultCols = ["Hiring", "Loans", "Health", "Insurance", "Housing", "Edu"];

function score(r: number, c: number) {
  const seeds = [0.9, 0.4, 0.7, 0.5, 0.85, 0.3, 0.6, 0.95, 0.55, 0.4, 0.7, 0.85, 0.5, 0.6, 0.95, 0.45, 0.75, 0.4, 0.85, 0.6, 0.5, 0.9, 0.7, 0.55, 0.8, 0.4, 0.65, 0.9, 0.5, 0.7];
  return seeds[(r * defaultCols.length + c) % seeds.length];
}

function color(v: number) {
  if (v > 0.75) return { bg: "rgba(16,185,129,0.7)", glow: "rgba(16,185,129,0.6)" };
  if (v > 0.5) return { bg: "rgba(234,179,8,0.65)", glow: "rgba(234,179,8,0.5)" };
  return { bg: "rgba(239,68,68,0.7)", glow: "rgba(239,68,68,0.6)" };
}

export function Heatmap() {
  const { auditResult } = useAudit();
  const rows = defaultRows;
  const cols = defaultCols;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden"
    >
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative flex items-center justify-between mb-5">
        <div>
          <h3 style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 600 }} className="text-white">
            Fairness Heatmap
          </h3>
          <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/50 mt-0.5">
            {auditResult ? "Cross-attribute bias intensity matrix" : "Demo data — cross-attribute bias intensity matrix"}
          </p>
        </div>
        <div className="flex items-center gap-3" style={{ fontFamily: "Inter", fontSize: 10 }}>
          <Swatch c="rgba(16,185,129,0.7)" l="Fair" />
          <Swatch c="rgba(234,179,8,0.7)" l="Moderate" />
          <Swatch c="rgba(239,68,68,0.7)" l="Biased" />
        </div>
      </div>

      <div className="relative">
        <div className="grid gap-2" style={{ gridTemplateColumns: `80px repeat(${cols.length}, 1fr)` }}>
          <div />
          {cols.map((c) => (
            <div key={c} style={{ fontFamily: "Inter", fontSize: 10 }} className="text-center text-white/50 pb-1">
              {c}
            </div>
          ))}
          {rows.map((r, ri) => (
            <RowCells key={r} r={r} ri={ri} cols={cols} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function RowCells({ r, ri, cols }: { r: string; ri: number; cols: string[] }) {
  return (
    <>
      <div style={{ fontFamily: "Inter", fontSize: 11 }} className="flex items-center text-white/70">{r}</div>
      {cols.map((c, ci) => {
                const v = score(ri, ci);
                const col = color(v);
                return (
                  <motion.div
                    key={`${ri}-${ci}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (ri + ci) * 0.03 }}
                    whileHover={{ scale: 1.08, zIndex: 5 }}
                    className="group relative aspect-square rounded-lg cursor-pointer flex items-center justify-center"
                    style={{ background: col.bg, boxShadow: `0 0 12px ${col.glow}` }}
                  >
                    <span style={{ fontFamily: "Space Grotesk", fontSize: 11, fontWeight: 600 }} className="text-white/90">
                      {(v * 100).toFixed(0)}
                    </span>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap px-2 py-1 rounded-md bg-black/90 border border-white/10" style={{ fontFamily: "Inter", fontSize: 10 }}>
                      <div className="text-white">{r} × {c}</div>
                      <div className="text-white/60">Score: {(v * 100).toFixed(0)}/100</div>
                    </div>
                  </motion.div>
                );
              })}
    </>
  );
}

function Swatch({ c, l }: { c: string; l: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
      <span className="text-white/60">{l}</span>
    </div>
  );
}
