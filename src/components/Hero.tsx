"use client";

import { useGsapTextReveal, useGsapEntrance } from "@/hooks/useAnimations";
import { SplitText } from "./ui/SplitText";
import { useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  // We trigger the text reveal slightly after the preloader finishes (delay: 0.5s)
  const textRef = useGsapTextReveal(0.5); 
  // We make the vehicle "drive" in from the right (delay: 0.8s)
  const vehicleRef = useGsapEntrance('right', 0.8);
  const badgeRef = useGsapEntrance('bottom', 1.2);

  const buttonRef = useRef<HTMLButtonElement>(null);

  // Micro-interaction: Extraordinary pulse on hover
  const handleButtonHover = () => {
    gsap.to(buttonRef.current, {
      boxShadow: "0px 0px 30px 5px rgba(233,69,96,0.6)", // Glowing signal-red
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleButtonLeave = () => {
    gsap.to(buttonRef.current, {
      boxShadow: "0px 0px 20px 0px rgba(233,69,96,0.3)",
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-void-navy">
      {/* Background Deep Space */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cobalt/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Column: Text & CTA */}
        <div ref={textRef} className="max-w-2xl">
          <div className="reveal-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/30 border border-cobalt text-signal-red text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
            100% Risk-Free Investment
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-crisp-white leading-tight mb-6">
            <SplitText text="Invest in" /> <br />
            <span className="text-slate-light">
              <SplitText text="Lagos Transport." />
            </span>
          </h1>
          
          <p className="reveal-text text-lg md:text-xl text-slate-light/80 mb-10 leading-relaxed max-w-xl">
            We handle the riders, the maintenance, and the street-level operations. You get guaranteed weekly returns backed by a concrete agreement. No Agberos. No stories.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 reveal-text">
            <button 
              ref={buttonRef}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              className="px-8 py-4 bg-signal-red text-crisp-white font-semibold rounded-lg shadow-[0_0_20px_rgba(233,69,96,0.3)] relative overflow-hidden group"
            >
              {/* Subtle light sweep effect inside the button */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              Get an Investment Proposal
            </button>
          </div>
        </div>

        {/* Right Column: Premium Imagery (The Drive In) */}
        <div ref={vehicleRef} className="relative hidden lg:block h-[600px] w-full">
          {/* This container "drives" into frame based on the GSAP hook */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden border border-cobalt/50 shadow-[0_20px_50px_rgba(15,52,96,0.3)] bg-void-light relative group">
             
             {/* The Premium Image Placeholder */}
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-light font-bold">
                <span className="text-cobalt mb-2 text-6xl">📸</span>
                [High-End Keke/Uber Fleet Image]
             </div>
             
             {/* Engine Light / Headlight Effect (Subtle red/white glow at the edge) */}
             <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-signal-red/20 rounded-full blur-3xl" />
             
             {/* Premium Dark Gradient Overlay */}
             <div className="absolute inset-0 bg-gradient-to-tr from-void-navy via-transparent to-transparent opacity-80" />
          </div>

          {/* Floating Trust Badge */}
          <div ref={badgeRef} className="absolute -bottom-6 -left-6 bg-void-light border border-cobalt p-6 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="text-signal-red font-bold text-3xl">₦<span className="text-crisp-white">Guaranteed</span></div>
            <div className="text-slate-light text-sm mt-1">Weekly Remittances</div>
          </div>
        </div>
      </div>
    </section>
  );
}
