import { Github, Twitter, Linkedin, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#05060c] px-8 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }} className="text-white">
            Fair<span className="bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] bg-clip-text text-transparent">AI</span>
          </span>
        </div>
        <div className="flex gap-8 text-[13px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>
          <a href="#" className="hover:text-white">About</a>
          <a href="#" className="hover:text-white">Docs</a>
          <a href="#" className="hover:text-white">Contact</a>
          <a href="#" className="hover:text-white">Privacy</a>
        </div>
        <div className="flex gap-3">
          {[Github, Twitter, Linkedin].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition-all hover:border-white/30 hover:text-white"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/5 pt-6 text-center text-[11px] text-white/30" style={{ fontFamily: "Inter, sans-serif" }}>
        © 2026 FairAI. Designed for responsible intelligence.
      </div>
    </footer>
  );
}
