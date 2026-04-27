import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  const links = ["Platform", "Features", "How it works", "Impact", "Docs"];
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-8 py-5"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#3b82f6] via-[#8b5cf6] to-[#22d3ee]">
            <Sparkles className="h-4 w-4 text-white" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#3b82f6] via-[#8b5cf6] to-[#22d3ee] opacity-60 blur-md" />
          </div>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "0.02em" }} className="text-white">
            Fair<span className="bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] bg-clip-text text-transparent">AI</span>
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13px] text-white/70 transition-colors hover:text-white"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {l}
            </a>
          ))}
        </div>
        <Link
          to="/dashboard"
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-[13px] text-white backdrop-blur-md transition-all hover:bg-white/10"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Launch App
        </Link>
      </div>
    </motion.nav>
  );
}
