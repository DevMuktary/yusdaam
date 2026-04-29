"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";

export default function RiderCall() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    gsap.fromTo(".rider-content", 
      { opacity: 0, x: -30 }, 
      {
        opacity: 1, 
        x: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%", 
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-void-navy py-8 md:py-16 relative overflow-hidden w-full">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
        
        <div className="rider-content max-w-2xl z-10 order-2 lg:order-1">
          <h2 className="text-xs sm:text-sm font-bold tracking-widest text-signal-red uppercase mb-3">For Professional Drivers</h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-crisp-white mb-4 sm:mb-6 leading-tight">
            Drive the Best Assets. <br /> Keep Your Peace of Mind.
          </h3>
          <p className="text-base sm:text-lg text-slate-light mb-6 sm:mb-8 leading-relaxed">
            Are you tired of unfair daily delivery targets and working with faulty vehicles? At YUSDAAM, we partner with serious, professional drivers. We provide brand-new or expertly maintained vehicles, fair hire-purchase terms, and a management team that respects your hustle.
          </p>
          
          <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
            <li className="flex items-start text-crisp-white font-medium text-sm sm:text-base">
              <span className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-signal-red/20 text-signal-red flex items-center justify-center mr-3 sm:mr-4 mt-0.5">✓</span>
              Transparent Agreements. No Hidden Charges.
            </li>
            <li className="flex items-start text-crisp-white font-medium text-sm sm:text-base">
              <span className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-signal-red/20 text-signal-red flex items-center justify-center mr-3 sm:mr-4 mt-0.5">✓</span>
              Professional Maintenance Oversight.
            </li>
            <li className="flex items-start text-crisp-white font-medium text-sm sm:text-base">
              <span className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-signal-red/20 text-signal-red flex items-center justify-center mr-3 sm:mr-4 mt-0.5">✓</span>
              Protection from Unfair Street Harassment.
            </li>
          </ul>

          <Link 
            href="/riders/apply"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-4 bg-transparent border-2 border-signal-red text-signal-red hover:bg-signal-red hover:text-crisp-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(233,69,96,0.2)]"
          >
            Apply to Drive With Us
          </Link>
        </div>

        {/* Responsive Image: h-64 on mobile, h-[500px] on desktop */}
        <div className="relative h-64 sm:h-[350px] lg:h-[500px] w-full rounded-2xl overflow-hidden border border-cobalt shadow-2xl order-1 lg:order-2">
           <Image 
             src="/images/happy-rider.jpg" 
             alt="Professional YUSDAAM Driver"
             fill
             className="object-cover object-center opacity-90"
           />
           <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-void-navy via-void-navy/50 lg:via-transparent to-transparent opacity-90 lg:opacity-50" />
        </div>

      </div>
    </section>
  );
}
