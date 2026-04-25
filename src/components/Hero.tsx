"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Clean, professional fade-in. No cheesy letter-by-letter staggers.
    gsap.fromTo(
      ".hero-animate",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out", delay: 0.3 }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full pt-32 pb-20 lg:pt-48 lg:pb-32 bg-void-navy">
      <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Direct, Professional Copy */}
        <div className="max-w-2xl">
          <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-void-light border border-cobalt text-slate-light text-sm font-medium mb-8">
            <ShieldCheck size={16} className="text-signal-red" />
            100% Risk-Free Vehicle Management
          </div>
          
          <h1 className="hero-animate text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-crisp-white leading-[1.1] mb-6">
            Invest in transport. <br />
            <span className="text-slate-light">We handle the rest.</span>
          </h1>
          
          <p className="hero-animate text-lg text-slate-light mb-10 leading-relaxed max-w-lg">
            Purchase a tricycle, car, or minibus. We manage the drivers, daily operations, and maintenance so you can earn guaranteed weekly returns without the hassle.
          </p>

          <div className="hero-animate flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white font-semibold rounded-lg hover:bg-[#d83a54] transition-colors">
              Get an Investment Proposal
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-transparent border border-cobalt hover:bg-void-light text-crisp-white font-semibold rounded-lg transition-colors">
              See How It Works
            </button>
          </div>

          {/* Quick Trust Metrics */}
          <div className="hero-animate mt-12 flex items-center gap-6 text-sm text-slate-light font-medium">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-crisp-white">Lagos</span>
              <span>Primary Operations</span>
            </div>
            <div className="w-px h-10 bg-cobalt"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-crisp-white">Weekly</span>
              <span>Guaranteed Payouts</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean, Realistic Image Placeholder */}
        <div className="hero-animate relative hidden lg:block h-[600px] w-full rounded-2xl overflow-hidden bg-void-light border border-cobalt">
          {/* Replace this div with your actual next/image tag. No artificial glows. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-light p-10 text-center">
             <span className="text-4xl mb-4">📸</span>
             <p className="text-sm">
               [Insert a clean, high-resolution photo here. E.g., A real fleet parked neatly, or a professional driver. Let the photography do the heavy lifting.]
             </p>
          </div>
        </div>

      </div>
    </section>
  );
}
