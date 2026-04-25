"use client";

import { useGsapTextReveal } from "@/hooks/useAnimations";
import { SplitText } from "./ui/SplitText";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function Hero() {
  const textRef = useGsapTextReveal(0.5); 
  const buttonRef = useRef<HTMLButtonElement>(null);
  const floatingWrapperRef = useRef<HTMLDivElement>(null);

  // 1. The Continuous Floating Animation
  useGSAP(() => {
    gsap.to(floatingWrapperRef.current, {
      y: -12,
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: "sine.inOut"
    });
  });

  // 2. The Hover Interactions
  const handleButtonHover = () => {
    gsap.to(buttonRef.current, {
      boxShadow: "0px 0px 30px 8px rgba(233,69,96,0.5)", 
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleButtonLeave = () => {
    gsap.to(buttonRef.current, {
      boxShadow: "0px 10px 20px 0px rgba(233,69,96,0.3)",
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image 
          src="/images/keke-bg.jpg" 
          alt="YUSDAAM Transport Fleet"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-void-navy/95 via-void-navy/80 to-void-navy/95 z-10" />

      {/* CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center text-center relative z-20">
        
        <div ref={textRef} className="max-w-5xl flex flex-col items-center w-full">
          
          {/* SHARP CORPORATE BADGE (No more AI pill) */}
          <div className="reveal-text inline-flex items-center gap-3 px-4 py-2 border-l-4 border-signal-red bg-void-light/80 backdrop-blur-md text-slate-light text-xs sm:text-sm font-bold uppercase tracking-widest mb-8 shadow-lg">
            <span className="w-2 h-2 bg-signal-red animate-pulse" />
            Zero-Liability Fleet Management
          </div>
          
          {/* MAIN HEADLINE (Responsive sizing) */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-crisp-white leading-[1.1] mb-6 drop-shadow-2xl w-full">
            <SplitText text="Own the Asset." /> <br />
            <span className="text-slate-light">
              <SplitText text="We Drive the Returns." />
            </span>
          </h1>
          
          {/* SUBHEADING */}
          <p className="reveal-text text-base sm:text-lg md:text-2xl text-slate-light/90 mb-10 leading-snug max-w-2xl font-medium drop-shadow-md px-2">
            Professional management for Tricycles, Ride-hailing Cars, and Minibuses. You get guaranteed weekly remittances. No Agberos. No stories.
          </p>

          {/* BUTTONS (Mobile optimized) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto px-4 reveal-text">
            
            {/* FLOATING WRAPPER */}
            <div ref={floatingWrapperRef} className="w-full sm:w-auto">
              <button 
                ref={buttonRef}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-signal-red text-crisp-white text-base sm:text-lg font-bold shadow-[0_10px_20px_rgba(233,69,96,0.3)] relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                Start Earning Weekly
              </button>
            </div>
            
            <button className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-transparent border-2 border-slate-light/30 backdrop-blur-sm hover:border-slate-light hover:bg-void-light/50 text-crisp-white text-base sm:text-lg font-bold transition-all">
              View Vehicle ROI
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
