"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TheEngine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !vehicleRef.current) return;

    // Fixed for Mobile: Uses viewport width (vw) so it always crosses the whole screen
    gsap.to(vehicleRef.current, {
      x: "120vw", 
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 95%", 
        end: "bottom top",
        scrub: 1, 
      },
    });

    const steps = gsap.utils.toArray('.engine-step');
    steps.forEach((step: any) => {
      gsap.fromTo(step, 
        { opacity: 0, y: 40 }, 
        {
          opacity: 1, 
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: step,
            start: "top 95%", 
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative bg-void-light py-8 md:py-16 overflow-hidden border-y border-cobalt/30 w-full">
      
      {/* Parallax Layer: Starts off-screen left and drives across */}
      <div 
        ref={vehicleRef} 
        className="absolute top-[15%] md:top-1/4 -left-[300px] w-[250px] md:w-[400px] h-[150px] md:h-[250px] opacity-30 md:opacity-20 pointer-events-none z-0 mix-blend-screen"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-signal-red/20 to-transparent blur-3xl" />
        <Image 
          src="/images/keke-transparent.png" 
          alt="Driving Fleet"
          fill
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        <div className="text-center mb-12 md:mb-16 engine-step">
          <h2 className="text-xs sm:text-sm font-bold tracking-widest text-signal-red uppercase mb-3">The Operations Engine</h2>
          <h3 className="text-3xl md:text-5xl font-black text-crisp-white">How We Secure Your Asset</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-12">
          
          <div className="engine-step bg-void-navy border border-cobalt p-6 md:p-8 rounded-2xl shadow-xl hover:border-signal-red/50 transition-colors duration-500">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-cobalt/50 rounded-full flex items-center justify-center text-signal-red font-bold text-lg md:text-xl mb-4 md:mb-6">1</div>
            <h4 className="text-xl md:text-2xl font-bold text-crisp-white mb-3">Asset Placement</h4>
            <p className="text-slate-light text-sm md:text-base leading-relaxed">
              We don't just hand keys to anyone. Every vehicle is assigned to a rigorously vetted, guarantor-backed professional rider. We handle the onboarding, licensing checks, and placement so you don't have to.
            </p>
          </div>

          <div className="engine-step bg-void-navy border border-cobalt p-6 md:p-8 rounded-2xl shadow-xl hover:border-signal-red/50 transition-colors duration-500 mt-0 md:mt-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-cobalt/50 rounded-full flex items-center justify-center text-signal-red font-bold text-lg md:text-xl mb-4 md:mb-6">2</div>
            <h4 className="text-xl md:text-2xl font-bold text-crisp-white mb-3">Active Management</h4>
            <p className="text-slate-light text-sm md:text-base leading-relaxed">
              Your asset is constantly monitored. We manage daily route compliance, scheduled maintenance to prevent breakdowns, and handle all street-level union (Agbero) and municipal tax clearings.
            </p>
          </div>

          <div className="engine-step bg-void-navy border border-cobalt p-6 md:p-8 rounded-2xl shadow-xl hover:border-signal-red/50 transition-colors duration-500 mt-0 md:mt-16">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-cobalt/50 rounded-full flex items-center justify-center text-signal-red font-bold text-lg md:text-xl mb-4 md:mb-6">3</div>
            <h4 className="text-xl md:text-2xl font-bold text-crisp-white mb-3">Guaranteed Remittance</h4>
            <p className="text-slate-light text-sm md:text-base leading-relaxed">
              No stories about "low turnout" or "police wahala." Our automated financial ledger collects the daily funds from riders and triggers a guaranteed, consolidated weekly payment directly to your bank account.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
