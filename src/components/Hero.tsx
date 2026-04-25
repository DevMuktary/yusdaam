"use client";

import { useGsapTextReveal } from "@/hooks/useAnimations";
import { SplitText } from "./ui/SplitText";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function Hero() {
  const textRef = useGsapTextReveal(0.5); 
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const floatingWrapperRef = useRef<HTMLDivElement>(null);

  // 1. The Floating Animation (Smooth, continuous levitation)
  useGSAP(() => {
    if (floatingWrapperRef.current) {
      gsap.to(floatingWrapperRef.current, {
        y: -12, // Floats up 12px
        duration: 2,
        repeat: -1, // Infinite loop
        yoyo: true, // Goes back down smoothly
        ease: "sine.inOut",
        delay: 2.5 // Waits for the entrance animation to finish before floating
      });
    }
  });

  // 2. The Hover Pulse Effect (Remains intact for interaction)
  const handleButtonHover = () => {
    gsap.to(primaryBtnRef.current, {
      boxShadow: "0px 0px 30px 5px rgba(233,69,96,0.6)", 
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleButtonLeave = () => {
    gsap.to(primaryBtnRef.current, {
      boxShadow: "0px 0px 20px 0px rgba(233,69,96,0.3)",
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center pt-24 pb-12 overflow-hidden">
      
      {/* 1. BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image 
          src="/images/keke-bg.jpg" 
          alt="YUSDAAM Transport Fleet"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* 2. THE DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-void-navy/95 via-void-navy/80 to-void-navy/95 z-10" />

      {/* 3. THE CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center text-center relative z-20">
        
        <div ref={textRef} className="max-w-4xl flex flex-col items-center w-full">
          
          {/* AI Pill Badge REMOVED */}
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-crisp-white leading-[1.1] mb-6 drop-shadow-2xl">
            <SplitText text="Earn Weekly." /> <br />
            <span className="text-slate-light">
              <SplitText text="Without the Stress." />
            </span>
          </h1>
          
          <p className="reveal-text text-lg sm:text-xl md:text-2xl text-slate-light/95 mb-10 leading-relaxed max-w-3xl font-medium drop-shadow-lg px-2">
            Buy a Tricycle, Uber, or Minibus, and let the experts manage it. We vet the riders, handle the maintenance, and remit your money every week. No agberos, no excuses.
          </p>

          {/* CTA Buttons - Mobile Optimized (w-full on mobile, auto on larger screens) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full px-4 sm:px-0 reveal-text">
            
            {/* The Floating Wrapper specifically for the primary button */}
            <div ref={floatingWrapperRef} className="w-full sm:w-auto">
              <button 
                ref={primaryBtnRef}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-signal-red text-crisp-white text-base sm:text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(233,69,96,0.3)] relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                Start Earning Weekly
              </button>
            </div>
            
            <button className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-void-navy/40 backdrop-blur-md border-2 border-slate-light/20 hover:border-slate-light/60 hover:bg-void-light/60 text-crisp-white text-base sm:text-lg font-bold rounded-xl transition-all shadow-lg">
              See Investment Plans
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}
