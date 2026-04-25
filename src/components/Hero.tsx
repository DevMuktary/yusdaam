"use client";

import { useGsapTextReveal } from "@/hooks/useAnimations";
import { SplitText } from "./ui/SplitText";
import { useRef } from "react";
import gsap from "gsap";
import Image from "next/image";

export default function Hero() {
  // Trigger the text reveal after the preloader finishes
  const textRef = useGsapTextReveal(0.5); 
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Extraordinary pulse on hover for the button
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
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      
      {/* 1. YOUR KEKE BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full -z-20">
        <Image 
          src="/images/keke-bg.jpg" // Make sure your file name matches this exactly
          alt="YUSDAAM Transport Fleet"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* 2. THE DARK OVERLAY (Makes the text readable over the picture) */}
      <div className="absolute inset-0 bg-gradient-to-b from-void-navy/90 via-void-navy/70 to-void-navy/95 -z-10" />

      {/* 3. THE CONTENT */}
      <div className="container mx-auto px-6 md:px-12 flex flex-col items-center text-center relative z-10">
        
        <div ref={textRef} className="max-w-4xl flex flex-col items-center">
          
          <div className="reveal-text inline-flex items-center gap-2 px-4 py-2 rounded-full bg-void-navy/50 backdrop-blur-md border border-cobalt text-signal-red text-sm font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
            100% Risk-Free Investment in Lagos
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-crisp-white leading-tight mb-8 drop-shadow-2xl">
            <SplitText text="Invest in" /> <br />
            <span className="text-slate-light">
              <SplitText text="Real Transport." />
            </span>
          </h1>
          
          <p className="reveal-text text-xl md:text-2xl text-slate-light/90 mb-12 leading-relaxed max-w-2xl font-medium drop-shadow-md">
            We handle the riders, the maintenance, and the streets. You get guaranteed weekly returns. No Agberos. No stories.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 reveal-text">
            <button 
              ref={buttonRef}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              className="px-10 py-5 bg-signal-red text-crisp-white text-lg font-bold rounded-lg shadow-[0_0_20px_rgba(233,69,96,0.3)] relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              Get Your Proposal
            </button>
            
            <button className="px-10 py-5 bg-transparent border-2 border-slate-light/30 backdrop-blur-sm hover:border-slate-light hover:bg-void-light/50 text-crisp-white text-lg font-bold rounded-lg transition-all">
              View Portfolios
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
