"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapTextReveal } from "@/hooks/useAnimations";
import { SplitText } from "@/components/ui/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const textRef = useGsapTextReveal(0.2);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const sections = gsap.utils.toArray('.scroll-fade');
    sections.forEach((sec: any) => {
      gsap.fromTo(sec, 
        { opacity: 0, y: 30 }, // Reduced jump distance for mobile
        {
          opacity: 1, 
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 85%",
          }
        }
      );
    });

    const steps = gsap.utils.toArray('.timeline-step');
    gsap.fromTo(steps, 
      { opacity: 0, x: -15 },
      {
        opacity: 1, 
        x: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".timeline-container",
          start: "top 85%", // Triggers slightly earlier
        }
      }
    );
  }, { scope: containerRef });

  return (
    <main className="bg-void-navy min-h-screen text-crisp-white overflow-x-hidden w-full max-w-[100vw]" ref={containerRef}>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[60] px-4 sm:px-6 py-4 border-b border-cobalt/20 bg-void-navy/90 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-black tracking-wider hover:opacity-80 transition z-[70]">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          
          <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-light tracking-wide uppercase items-center">
            <Link href="/" className="hover:text-crisp-white hover:text-signal-red transition">Home</Link>
            <Link href="/about" className="text-signal-red transition">About Us</Link>
            <Link href="/services" className="hover:text-crisp-white hover:text-signal-red transition">Services</Link>
            <Link href="/quotes" className="hover:text-crisp-white hover:text-signal-red transition">Vehicle Quotes</Link>
          </div>
          
          <Link href="/auth/login" className="hidden md:inline-flex px-6 py-2.5 text-sm font-bold bg-cobalt border border-cobalt hover:border-slate-light/50 text-crisp-white rounded-lg hover:bg-void-light transition shadow-lg">
            Asset Owner Portal
          </Link>

          <button className="md:hidden text-crisp-white z-[70]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-void-navy/95 backdrop-blur-xl z-[50] flex flex-col items-center justify-center transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col gap-8 text-center text-lg font-bold text-slate-light uppercase tracking-widest">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Home</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-signal-red">About Us</Link>
          <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Services</Link>
          <Link href="/quotes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Vehicle Quotes</Link>
          <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 px-8 py-4 bg-signal-red text-crisp-white rounded-xl shadow-lg">
            Asset Owner Portal
          </Link>
        </div>
      </div>

      {/* TIGHTENED MAIN CONTAINER PADDING */}
      <div className="pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-6xl">
          
          {/* 1. EDITORIAL HERO SECTION */}
          {/* TIGHTENED: mb-32 -> mb-16 md:mb-32, pb-20 -> pb-12 md:pb-20 */}
          <div className="text-center mb-16 md:mb-32 border-b border-cobalt/20 pb-12 md:pb-20" ref={textRef}>
            <div className="reveal-text inline-flex items-center px-4 py-1.5 rounded-full border border-cobalt/50 text-slate-light text-[10px] sm:text-xs font-bold mb-6 sm:mb-8 tracking-widest uppercase">
              Registered CAC Entity | RC 9335611
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-crisp-white mb-4 sm:mb-6 uppercase leading-[1.1]">
              <SplitText text="Hire Purchase" /> <br />
              <span className="text-signal-red"><SplitText text="Administrators." /></span><br />
              <span className="text-slate-light/40 text-xl sm:text-4xl"><SplitText text="Not Fund Managers." /></span>
            </h1>
            <p className="reveal-text text-base sm:text-xl text-slate-light leading-relaxed font-medium max-w-3xl mx-auto mt-6 sm:mt-8">
              We provide strict hire purchase administration for vehicle owners across Nigeria. We manage Tricycles, Cars for Uber/Bolt, Motorcycles, Mini-Buses, and Tipper Trucks with zero tolerance for excuses.
            </p>
          </div>

          {/* 2. THE REALITY VS THE SHIELD */}
          {/* TIGHTENED: gap-16 md:gap-24, mb-16 md:mb-32 */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16 md:mb-32 scroll-fade">
            
            {/* The Problem */}
            <div className="relative">
              <div className="absolute -left-4 md:-left-6 top-0 w-1 h-full bg-slate-light/20 hidden md:block" />
              <h3 className="text-xs sm:text-sm font-bold tracking-widest text-slate-light/60 uppercase mb-3 sm:mb-4">The Street Reality</h3>
              <h2 className="text-2xl sm:text-3xl font-bold text-crisp-white mb-4 sm:mb-6 leading-tight">You buy a vehicle to earn. Instead, you buy stress.</h2>
              <p className="text-slate-light text-base sm:text-lg leading-relaxed mb-6">
                Reality hits fast: drivers give endless excuses, vehicles go untraceable, sudden "repairs" drain your income, and street harassment (Agberos) kills your collection.
              </p>
              <div className="p-5 sm:p-6 border-l-2 border-signal-red bg-void-light/10 text-crisp-white text-sm sm:text-base font-medium italic">
                "Most owners lack the time, legal structure, or street enforcement to manage riders. Result: 70% sell at a loss within 8 months."
              </div>
            </div>

            {/* The Solution */}
            <div className="relative mt-8 md:mt-0">
              <div className="absolute -left-4 md:-left-6 top-0 w-1 h-full bg-cobalt/50 hidden md:block" />
              <h3 className="text-xs sm:text-sm font-bold tracking-widest text-cobalt uppercase mb-3 sm:mb-4">The Corporate Shield</h3>
              <h2 className="text-2xl sm:text-3xl font-bold text-crisp-white mb-4 sm:mb-6 leading-tight">You Own. We Enforce. Zero Fees To You.</h2>
              <p className="text-slate-light text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                You buy the vehicle in your name and appoint us through a Power of Attorney. We handle the vetting, the GPS installation, and the ruthless enforcement of weekly installments.
              </p>
              <p className="text-slate-light text-base sm:text-lg leading-relaxed">
                We deal with the police, the agberos, the defaults, and the stories. You don’t.
              </p>
            </div>

          </div>

          {/* 3. THE AUTHORITATIVE ₦0 BANNER */}
          {/* TIGHTENED: py-12 md:py-24 mb-16 md:mb-32 */}
          <div className="py-12 md:py-24 border-y border-cobalt/20 text-center mb-16 md:mb-32 scroll-fade">
            <h3 className="text-xs sm:text-sm font-bold tracking-widest text-signal-red uppercase mb-4 sm:mb-6">Our Revenue Model</h3>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-crisp-white mb-6 sm:mb-8 tracking-tight">You Pay Us ₦0.</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-light max-w-4xl mx-auto leading-relaxed font-medium">
              Our service is 100% free to vehicle owners. We charge drivers a small daily service fee for management and tracking. Since we source the rider and enforce the work, the rider pays for the service—not you. All running costs remain the driver's absolute responsibility.
            </p>
          </div>

          {/* 4. THE 5-STEP TIMELINE */}
          {/* TIGHTENED: mb-16 md:mb-32 */}
          <div className="mb-16 md:mb-32 max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-20 scroll-fade">
              <h3 className="text-xs sm:text-sm font-bold tracking-widest text-signal-red uppercase mb-3 sm:mb-4">The Architecture</h3>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-crisp-white">How The Administration Works</h2>
            </div>

            {/* TIGHTENED TIMELINE SPACING: space-y-12 md:space-y-20 */}
            <div className="relative border-l border-cobalt/30 ml-2 sm:ml-4 md:ml-12 space-y-12 md:space-y-20 timeline-container">
              
              <div className="relative pl-6 sm:pl-8 md:pl-16 timeline-step">
                <span className="absolute -left-[5px] top-1.5 sm:top-2 w-2.5 h-2.5 rounded-full bg-signal-red shadow-[0_0_10px_rgba(233,69,96,0.8)]" />
                <h4 className="text-xl sm:text-2xl font-bold text-crisp-white mb-2 sm:mb-3">1. You Buy The Vehicle. Keep 100% Ownership.</h4>
                <p className="text-slate-light text-base sm:text-lg leading-relaxed">
                  You purchase the vehicle directly from the dealer. All papers carry your name only. You hold the originals. We never touch your purchase money or pool funds. You pay the dealer directly or via lawyer escrow.
                </p>
              </div>

              <div className="relative pl-6 sm:pl-8 md:pl-16 timeline-step">
                <span className="absolute -left-[5px] top-1.5 sm:top-2 w-2.5 h-2.5 rounded-full bg-cobalt shadow-[0_0_10px_rgba(30,144,255,0.8)]" />
                <h4 className="text-xl sm:text-2xl font-bold text-crisp-white mb-2 sm:mb-3">2. You Appoint Us. We Do The Work.</h4>
                <p className="text-slate-light text-base sm:text-lg leading-relaxed">
                  Sign a Power of Attorney appointing YUSDAAM AUTOS as your administrator. This lets us legally manage the asset on your behalf. You remain the owner. We become the enforcer.
                </p>
              </div>

              <div className="relative pl-6 sm:pl-8 md:pl-16 timeline-step">
                <span className="absolute -left-[5px] top-1.5 sm:top-2 w-2.5 h-2.5 rounded-full bg-cobalt shadow-[0_0_10px_rgba(30,144,255,0.8)]" />
                <h4 className="text-xl sm:text-2xl font-bold text-crisp-white mb-4 sm:mb-6">3. We Vet The Rider — 5-Point Check</h4>
                <div className="grid sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-8 text-sm sm:text-base text-slate-light bg-void-light/10 p-5 sm:p-6 rounded-xl border border-cobalt/20">
                  <div className="flex gap-2.5 sm:gap-3 items-start"><CheckCircle2 size={18} className="text-signal-red shrink-0 mt-0.5 sm:w-5 sm:h-5" /><span><strong>Home Verified:</strong> Confirmed with family.</span></div>
                  <div className="flex gap-2.5 sm:gap-3 items-start"><CheckCircle2 size={18} className="text-signal-red shrink-0 mt-0.5 sm:w-5 sm:h-5" /><span><strong>Guarantors:</strong> Secured with property/jobs.</span></div>
                  <div className="flex gap-2.5 sm:gap-3 items-start"><CheckCircle2 size={18} className="text-signal-red shrink-0 mt-0.5 sm:w-5 sm:h-5" /><span><strong>Park Confirmed:</strong> Chairman verification.</span></div>
                  <div className="flex gap-2.5 sm:gap-3 items-start"><CheckCircle2 size={18} className="text-signal-red shrink-0 mt-0.5 sm:w-5 sm:h-5" /><span><strong>Police Cleared:</strong> Zero criminal record.</span></div>
                  <div className="flex gap-2.5 sm:gap-3 items-start sm:col-span-2"><CheckCircle2 size={18} className="text-signal-red shrink-0 mt-0.5 sm:w-5 sm:h-5" /><span><strong>Work History:</strong> Past bosses confirm previous hire purchase completion.</span></div>
                </div>
                <p className="mt-4 text-[10px] sm:text-xs font-bold text-signal-red uppercase tracking-widest">No rider passes without all 5 verified.</p>
              </div>

              <div className="relative pl-6 sm:pl-8 md:pl-16 timeline-step">
                <span className="absolute -left-[5px] top-1.5 sm:top-2 w-2.5 h-2.5 rounded-full bg-cobalt shadow-[0_0_10px_rgba(30,144,255,0.8)]" />
                <h4 className="text-xl sm:text-2xl font-bold text-crisp-white mb-2 sm:mb-3">4. We Protect & Enforce Daily</h4>
                <p className="text-slate-light text-base sm:text-lg leading-relaxed mb-3 sm:mb-4">Before handover, we install GPS Tracking and a remote engine Immobilizer. Then we manage:</p>
                <div className="space-y-2 sm:space-y-3 text-slate-light text-sm sm:text-base md:text-lg pl-3 sm:pl-4 border-l-2 border-cobalt/30">
                  <p>• <strong>Weekly Collection:</strong> Paid directly to designated accounts.</p>
                  <p>• <strong>Day-7 Repossession:</strong> Miss a payment by 7 days? We recover the vehicle.</p>
                  <p>• <strong>Street Level Issues:</strong> We handle Agbero harassment and police cases.</p>
                </div>
              </div>

              <div className="relative pl-6 sm:pl-8 md:pl-16 timeline-step">
                <span className="absolute -left-[5px] top-1.5 sm:top-2 w-2.5 h-2.5 rounded-full bg-signal-red shadow-[0_0_15px_rgba(233,69,96,1)]" />
                <h4 className="text-xl sm:text-2xl font-bold text-crisp-white mb-2 sm:mb-3">5. You Receive 100%. We Charge Rider.</h4>
                <p className="text-slate-light text-base sm:text-lg leading-relaxed">
                  We take no commission from your remittance. You receive the full weekly installment the rider agreed to pay. 
                  <br /><br />
                  <strong className="text-signal-red">If a Driver Defaults?</strong> We enforce the contract, repossess in your name, and place it with a new vetted driver. You don’t chase anyone. We do.
                </p>
              </div>

            </div>
          </div>

          {/* 5. LEGAL STANDING & TRACK RECORD */}
          {/* TIGHTENED: pt-12 md:pt-20, gap-12 md:gap-16 */}
          <div className="pt-12 md:pt-20 border-t border-cobalt/20 grid lg:grid-cols-2 gap-12 md:gap-16 scroll-fade">
            
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-crisp-white mb-4 sm:mb-6 border-b border-cobalt pb-3 sm:pb-4">Our Track Record</h3>
              <p className="text-slate-light text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                Since 2022, we’ve placed over 200 vehicles on hire purchase. Our historical driver performance maintains a <strong>92% weekly payment rate</strong>.
              </p>
              <p className="text-slate-light text-xs sm:text-sm italic leading-relaxed mb-6">
                *Past performance does not guarantee future results. Our job is strict enforcement, not promises.
              </p>
              <div className="text-lg sm:text-xl font-black text-signal-red uppercase tracking-wide leading-tight">
                You didn’t buy a vehicle to become a debt collector. <br className="hidden sm:block" /> And you shouldn’t pay to avoid it.
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-crisp-white mb-4 sm:mb-6 border-b border-cobalt pb-3 sm:pb-4">What We Are Not</h3>
              <div className="space-y-4 sm:space-y-6 text-slate-light text-base sm:text-lg leading-relaxed">
                <p>
                  <strong>We do not pool funds</strong> or collect vehicle purchase money. Asset owners pay dealers directly or via a lawyer's escrow.
                </p>
                <p>
                  <strong>We do not guarantee human behavior.</strong> We guarantee the enforcement of the contract. If a driver defaults, we trigger our recovery protocols immediately.
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-light/50 font-bold mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-cobalt/20">
                  This document does not constitute investment advice. YUSDAAM AUTOS is not a SEC-licensed fund manager.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
