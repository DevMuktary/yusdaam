"use client";

import { useGsapTextReveal } from "@/hooks/useAnimations";
import { SplitText } from "./ui/SplitText";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const textRef = useGsapTextReveal(0.5); 
  const primaryBtnRef = useRef<HTMLAnchorElement>(null);
  const floatingWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (floatingWrapperRef.current) {
      gsap.to(floatingWrapperRef.current, {
        y: -8, 
        duration: 2.5,
        repeat: -1, 
        yoyo: true, 
        ease: "sine.inOut",
        delay: 2.5 
      });
    }
  });

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
    // FIXED: Changed pt-24 to pt-6 on mobile and pt-12 on desktop to remove the massive top gap
    <section className="relative min-h-[85svh] md:min-h-[100svh] flex items-center justify-center pt-6 md:pt-12 pb-8 md:pb-12 overflow-hidden w-full">
      
      <div className="absolute inset-0 w-full h-full z-0">
        <Image 
          src="/images/keke-bg.jpg" 
          alt="YUSDAAM Transport Fleet"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-void-navy/95 via-void-navy/85 to-void-navy/95 z-10" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center text-center relative z-20">
        
        <div ref={textRef} className="max-w-5xl flex flex-col items-center w-full">
          
          <div className="reveal-text flex flex-col sm:flex-row items-center justify-center px-4 py-2 sm:py-1.5 rounded-xl sm:rounded-full bg-void-navy/70 backdrop-blur-md border border-cobalt/50 text-slate-light text-[10px] sm:text-xs font-semibold mb-6 tracking-widest uppercase text-center w-max mx-auto">
            <span>Yusdaam Autos Investment Mgt Nig Ltd.</span>
            <span className="hidden sm:inline mx-2 text-cobalt">|</span>
            <span className="mt-1 sm:mt-0 text-signal-red">(RC-9335611)</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-crisp-white leading-[1.1] mb-4 drop-shadow-2xl uppercase">
            <SplitText text="Own the asset." /> <br />
            <span className="text-slate-light">
              <SplitText text="We do the work." />
            </span> <br />
            <span className="text-signal-red">
              <SplitText text="You get paid weekly." />
            </span>
          </h1>

          <h2 className="reveal-text text-lg sm:text-xl md:text-2xl font-bold text-crisp-white mb-4 drop-shadow-lg">
          Zero-Friction Management. Contractual Maintenance. Regular Settlement Notifications..
          </h2>
          
          <p className="reveal-text text-sm sm:text-base md:text-lg text-slate-light/95 mb-6 leading-relaxed max-w-4xl font-medium drop-shadow-lg px-2">
            Buy a tricycle, Uber car, Mini-bus, Long-bus or Tipper truck. We handle the driver, maintenance, police wahala, and agberos. You receive weekly remittance direct to your bank. No pooling of funds. You own it, we manage it.
          </p>

          <div className="reveal-text text-xs md:text-sm text-slate-light/70 mb-8 font-bold tracking-widest uppercase border-b border-cobalt pb-1 inline-block">
            We manage vehicles, not investments.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0 reveal-text">
            <div ref={floatingWrapperRef} className="w-full sm:w-auto">
              <Link 
                href="/quotes"
                ref={primaryBtnRef}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-signal-red text-crisp-white text-base font-bold rounded-xl shadow-[0_0_20px_rgba(233,69,96,0.3)] relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                Get Purchase Quote
              </Link>
            </div>
            
            <Link 
              href="/services"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-void-navy/40 backdrop-blur-md border-2 border-slate-light/20 hover:border-slate-light/60 hover:bg-void-light/60 text-crisp-white text-base font-bold rounded-xl transition-all shadow-lg"
            >
              View Vehicle Options
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
