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
      { opacity: 0, x: -50 },
      {
        opacity: 1, 
        x: 0,
        duration: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-void-navy py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Copy for the Riders */}
        <div className="rider-content max-w-2xl z-10">
          <h2 className="text-sm font-bold tracking-widest text-signal-red uppercase mb-4">For Professional Drivers</h2>
          <h3 className="text-4xl md:text-5xl font-black text-crisp-white mb-6 leading-tight">
            Drive the Best Assets. <br /> Keep Your Peace of Mind.
          </h3>
          <p className="text-lg text-slate-light mb-8 leading-relaxed">
            Are you tired of unfair daily delivery targets and working with faulty vehicles? At YUSDAAM, we partner with serious, professional drivers. We provide brand-new or expertly maintained vehicles, fair hire-purchase terms, and a management team that respects your hustle.
          </p>
          
          <ul className="space-y-4 mb-10">
            <li className="flex items-center text-crisp-white font-medium">
              <span className="w-6 h-6 rounded-full bg-signal-red/20 text-signal-red flex items-center justify-center mr-4">✓</span>
              Transparent Agreements. No Hidden Charges.
            </li>
            <li className="flex items-center text-crisp-white font-medium">
              <span className="w-6 h-6 rounded-full bg-signal-red/20 text-signal-red flex items-center justify-center mr-4">✓</span>
              Routine Maintenance Support Included.
            </li>
            <li className="flex items-center text-crisp-white font-medium">
              <span className="w-6 h-6 rounded-full bg-signal-red/20 text-signal-red flex items-center justify-center mr-4">✓</span>
              Protection from Unfair Street Harassment.
            </li>
          </ul>

          <Link 
            href="/riders/apply"
            className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-signal-red text-signal-red hover:bg-signal-red hover:text-crisp-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(233,69,96,0.2)]"
          >
            Apply to Drive With Us
          </Link>
        </div>

        {/* Right: Authentic Imagery */}
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-cobalt shadow-2xl">
           <Image 
             src="/images/happy-rider.jpg" // Upload a picture of a smiling, professional Nigerian driver in/near a vehicle
             alt="Professional YUSDAAM Driver"
             fill
             className="object-cover opacity-90"
           />
           {/* Gradient to blend image nicely */}
           <div className="absolute inset-0 bg-gradient-to-r from-void-navy via-transparent to-transparent opacity-80 lg:opacity-50" />
        </div>

      </div>
    </section>
  );
}
