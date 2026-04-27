import { motion } from "motion/react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export function Topbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-20 backdrop-blur-2xl bg-black/30 border-b border-white/5"
    >
      <div className="flex items-center gap-4 px-8 py-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            placeholder="Search models, datasets..."
            style={{ fontFamily: "Inter", fontSize: 13 }}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_25px_rgba(59,130,246,0.2)] transition"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 500 }} className="text-emerald-300">
            System Active
          </span>
        </div>

        <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-white/70 hover:text-white">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-white/70 hover:text-white"
          style={{ fontFamily: "Inter", fontSize: 12 }}
        >
          ← Home
        </Link>
      </div>
    </motion.header>
  );
}
