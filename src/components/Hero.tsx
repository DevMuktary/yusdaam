"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ShieldCheck, Activity, BarChart3 } from "lucide-react";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Fast, mechanical slide-ups. No slow, floaty delays.
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
    
    tl.fromTo(".hero-line", { y: "100%" }, { y: "0%", stagger: 0.1, delay: 0.2 })
      .fromTo(".hero-fade", { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.4")
      .fromTo(".hero-border", { scaleX: 0 }, { scaleX: 1, duration: 1 }, "-=0.6");
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-[90vh] bg-void-navy flex flex-col justify-end pt-32 pb-12 border-b border-cobalt">
      
      <div className="container mx-auto px-6 lg:px-12">
        {/* Top Grid: Main Copy & Image Cutout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          
          {/* Brutalist Typography Area */}
          <div className="lg:col-span-7">
            <div className="hero-fade inline-flex items-center gap-2 px-3 py-1 bg-void-light border border-cobalt text-slate-light text-xs font-mono uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 bg-signal-red" />
              Lagos Transport Operations
            </div>
            
            {/* Using overflow-hidden to let text slide up sharply from behind an invisible mask */}
            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black uppercase tracking-tighter leading-[0.9] text-crisp-white mb-6">
              <div className="overflow-hidden pb-2"><div className="hero-line">Zero Risk.</div></div>
              <div className="overflow-hidden pb-2"><div className="hero-line text-slate-light">Maximum Yield.</div></div>
            </h1>
            
            <p className="hero-fade text-lg text-slate-light max-w-lg font-light leading-relaxed mb-10">
              Institutional-grade fleet management. You own the asset; we manage the riders, the streets, and the remittance. No informal sector headaches.
            </p>

            <div className="hero-fade flex items-center gap-4">
              <button className="flex items-center gap-3 px-8 py-4 bg-signal-red hover:bg-signal-red/90 text-crisp-white font-bold uppercase tracking-wide text-sm transition-colors">
                Get Proposal <ArrowRight size={18} />
              </button>
              <button className="px-8 py-4 bg-transparent border border-cobalt hover:bg-void-light text-crisp-white font-bold uppercase tracking-wide text-sm transition-colors">
                View Fleet
              </button>
            </div>
          </div>

          {/* Sharp, Data-Driven Media Container */}
          <div className="lg:col-span-5 h-[400px] relative hero-fade">
            <div className="absolute inset-0 border border-cobalt bg-void-light p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start border-b border-cobalt pb-4">
                <span className="text-xs font-mono text-slate-light uppercase">Asset Interface</span>
                <Activity size={16} className="text-signal-red" />
              </div>
              
              {/* Replace this div with your actual next/image later */}
              <div className="flex-grow my-4 bg-void-navy border border-cobalt flex items-center justify-center text-slate-light/50 font-mono text-sm">
                [ PREMIUM FLEET IMAGE HERE ]
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-cobalt">
                <div>
                  <div className="text-xs font-mono text-slate-light mb-1">Status</div>
                  <div className="text-signal-red font-bold text-sm uppercase">Active Operations</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-light mb-1">Coverage</div>
                  <div className="text-crisp-white font-bold text-sm uppercase">Lagos State</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Data Strip (Bloomberg Terminal Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-cobalt pt-8 hero-fade">
          <div className="flex flex-col gap-2 border-r border-cobalt/50 pr-6">
            <ShieldCheck size={20} className="text-slate-light mb-2" />
            <span className="text-3xl font-black text-crisp-white">100%</span>
            <span className="text-sm text-slate-light font-mono">Capital & Risk Protection</span>
          </div>
          
          <div className="flex flex-col gap-2 border-r border-cobalt/50 px-6">
            <BarChart3 size={20} className="text-slate-light mb-2" />
            <span className="text-3xl font-black text-crisp-white">Weekly</span>
            <span className="text-sm text-slate-light font-mono">Guaranteed Remittances</span>
          </div>
          
          <div className="flex flex-col gap-2 pl-6">
            <Activity size={20} className="text-slate-light mb-2" />
            <span className="text-3xl font-black text-crisp-white">5+</span>
            <span className="text-sm text-slate-light font-mono">Vehicle Classes Managed</span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
