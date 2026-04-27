import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Problem } from "../components/landing/Problem";
import { Features } from "../components/landing/Features";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Dashboard } from "../components/landing/Dashboard";
import { Impact } from "../components/landing/Impact";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05060c] text-white antialiased" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <Dashboard />
        <Impact />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
