"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

// Register the GSAP plugin for scroll animations
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TheEngine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !vehicleRef.current) return;

    // The Drive-by Animation tied to the scroll position
    gsap.to(vehicleRef.current, {
      xPercent: 200, // Drives across the screen
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom", // Starts when the section enters the bottom of the screen
        end: "bottom top",   // Ends when the section leaves the top
        scrub: 1,            // Smooth scrubbing effect (1 second catch-up)
      },
    });

    // Staggered fade up for the operation steps
    const steps = gsap.utils.toArray('.engine-step');
    steps.forEach((step: any) => {
      gsap.fromTo(step, 
        { opacity: 0, y: 50 },
        {
          opacity: 1, 
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: step,
            start: "top 80%", // Fades in when the element reaches 80% down the screen
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative bg-void-light py-32 overflow-hidden border-y border-cobalt/30">
      
      {/* 1. THE DRIVING VEHICLE (Parallax Layer) */}
      <div 
        ref={vehicleRef} 
        className="absolute top-1/3 -left-[20%] w-[400px] h-[250px] opacity-20 pointer-events-none z-0 mix-blend-screen"
      >
        {/* Placeholder: Add a clean PNG of a Keke or Car with a transparent background here later */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-signal-red/10 to-transparent blur-3xl" />
        <Image 
          src="/images/keke-transparent.png" // You'll need to upload a transparent background vehicle image here
          alt="Driving Fleet"
          fill
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        <div className="text-center mb-24 engine-step">
          <h2 className="text-sm font-bold tracking-widest text-signal-red uppercase mb-4">The Operations Engine</h2>
          <h3 className="text-4xl md:text-5xl font-black text-crisp-white">How We Secure Your Investment</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Step 1 */}
          <div className="engine-step bg-void-navy border border-cobalt p-8 rounded-2xl shadow-xl hover:border-signal-red/50 transition-colors duration-500">
            <div className="w-12 h-12 bg-cobalt/50 rounded-full flex items-center justify-center text-signal-red font-bold text-xl mb-6">1</div>
            <h4 className="text-2xl font-bold text-crisp-white mb-4">Asset Placement</h4>
            <p className="text-slate-light leading-relaxed">
              We don't just hand keys to anyone. Every vehicle is assigned to a rigorously vetted, guarantor-backed professional rider. We handle the onboarding, licensing checks, and placement so you don't have to.
            </p>
          </div>

          {/* Step 2 */}
          <div className="engine-step bg-void-navy border border-cobalt p-8 rounded-2xl shadow-xl hover:border-signal-red/50 transition-colors duration-500 mt-0 md:mt-12">
            <div className="w-12 h-12 bg-cobalt/50 rounded-full flex items-center justify-center text-signal-red font-bold text-xl mb-6">2</div>
            <h4 className="text-2xl font-bold text-crisp-white mb-4">Active Management</h4>
            <p className="text-slate-light leading-relaxed">
              Your asset is constantly monitored. We manage daily route compliance, scheduled maintenance to prevent breakdowns, and handle all street-level union (Agbero) and municipal tax clearings.
            </p>
          </div>

          {/* Step 3 */}
          <div className="engine-step bg-void-navy border border-cobalt p-8 rounded-2xl shadow-xl hover:border-signal-red/50 transition-colors duration-500 mt-0 md:mt-24">
            <div className="w-12 h-12 bg-cobalt/50 rounded-full flex items-center justify-center text-signal-red font-bold text-xl mb-6">3</div>
            <h4 className="text-2xl font-bold text-crisp-white mb-4">Guaranteed Remittance</h4>
            <p className="text-slate-light leading-relaxed">
              No stories about "low turnout" or "police wahala." Our automated financial ledger collects the daily funds from riders and triggers a guaranteed, consolidated weekly payment directly to your bank account.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
