"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldCheck, AlertTriangle, CheckCircle2, Shield, MapPin, FileText } from "lucide-react";
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

    // Fade in sections on scroll
    const sections = gsap.utils.toArray('.scroll-fade');
    sections.forEach((sec: any) => {
      gsap.fromTo(sec, 
        { opacity: 0, y: 30 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: sec,
            start: "top 85%",
          }
        }
      );
    });

    // Stagger the 5 steps
    const steps = gsap.utils.toArray('.step-card');
    gsap.fromTo(steps, 
      { opacity: 0, x: -20 },
      {
        opacity: 1, 
        x: 0,
        duration: 0.5,
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".steps-container",
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <main className="bg-void-navy min-h-screen text-crisp-white overflow-x-hidden w-full max-w-[100vw]" ref={containerRef}>
      
      {/* NAVBAR (Reused from Homepage for consistency) */}
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

      <div className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          
          {/* HERO SECTION */}
          <div className="max-w-4xl mx-auto text-center mb-20" ref={textRef}>
            <div className="reveal-text inline-flex items-center px-4 py-1.5 rounded-full bg-void-light border border-cobalt text-slate-light text-xs font-bold mb-6 tracking-widest uppercase">
              RC 9335611
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-crisp-white mb-6 uppercase">
              <SplitText text="Hire Purchase" /> <br />
              <span className="text-signal-red"><SplitText text="Administrators." /></span><br />
              <span className="text-slate-light/50 text-3xl sm:text-4xl"><SplitText text="Not Fund Managers." /></span>
            </h1>
            <p className="reveal-text text-lg sm:text-xl text-slate-light leading-relaxed font-medium">
              YUSDAAM AUTOS provides hire purchase administration for vehicle owners across Nigeria. We manage Tricycles, Cars for Uber/Bolt, Motorcycles, Mini-Buses, and Tipper Trucks.
            </p>
          </div>

          {/* PROBLEM VS SOLUTION GRID */}
          <div className="grid md:grid-cols-2 gap-8 mb-20 scroll-fade">
            <div className="bg-void-light/20 border border-signal-red/30 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-signal-red" />
              <div className="flex items-center gap-3 mb-4 text-signal-red">
                <AlertTriangle size={24} />
                <h3 className="text-2xl font-bold uppercase">The Problem</h3>
              </div>
              <p className="text-slate-light leading-relaxed">
                You purchase a vehicle to earn from transport. But reality hits: drivers give excuses, vehicles go untraceable, repairs drain your income, and agbero harassment kills collection. 
                <br /><br />
                Most owners lack the time, legal structure, or street enforcement to manage riders. <strong>Result: 70% sell at a loss within 8 months.</strong>
              </p>
            </div>

            <div className="bg-void-light/40 border border-cobalt p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-cobalt" />
              <div className="flex items-center gap-3 mb-4 text-crisp-white">
                <ShieldCheck size={24} className="text-cobalt" />
                <h3 className="text-2xl font-bold uppercase">Our Solution</h3>
              </div>
              <p className="text-slate-light leading-relaxed">
                <strong>You Own. We Enforce. Zero Fees To You.</strong>
                <br /><br />
                You buy the vehicle in your name and appoint us through a Power of Attorney. We handle vetting drivers, signing Hire Purchase Agreements, installing GPS + immobilizers, and enforcing weekly installments. 
                <br /><br />
                We deal with police, agberos, defaults, and excuses. You don’t.
              </p>
            </div>
          </div>

          {/* HOW WE GET PAID (The ₦0 Banner) */}
          <div className="bg-gradient-to-r from-void-light to-void-navy border border-cobalt p-8 sm:p-12 rounded-2xl text-center mb-20 scroll-fade shadow-2xl">
            <h3 className="text-xs font-bold tracking-widest text-signal-red uppercase mb-4">How We Get Paid</h3>
            <h2 className="text-4xl sm:text-5xl font-black text-crisp-white mb-6">You Pay Us ₦0.</h2>
            <p className="text-lg text-slate-light max-w-3xl mx-auto leading-relaxed">
              Our service is 100% free to vehicle owners. We charge drivers/riders a small daily service fee for management, tracking, and support. Since we source the rider and do the work, the rider pays for the service, not you. All running costs, fuel, repairs, and levies remain the driver's responsibility under the Hire Purchase Agreement.
            </p>
          </div>

          {/* THE 5 STEPS */}
          <div className="mb-24">
            <div className="text-center mb-12 scroll-fade">
              <h3 className="text-xs font-bold tracking-widest text-signal-red uppercase mb-2">How It Works</h3>
              <h2 className="text-3xl md:text-4xl font-black text-crisp-white">The Administration Process</h2>
            </div>

            <div className="grid gap-6 max-w-5xl mx-auto steps-container">
              
              <div className="step-card flex flex-col sm:flex-row gap-6 bg-void-light/30 border border-cobalt/50 p-6 rounded-2xl items-start">
                <div className="w-12 h-12 shrink-0 bg-cobalt flex items-center justify-center text-xl font-bold rounded-xl">1</div>
                <div>
                  <h4 className="text-xl font-bold text-crisp-white mb-2">You Buy The Vehicle. Keep 100% Ownership.</h4>
                  <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                    You purchase the vehicle directly from the dealer. All papers carry your name only. You hold the originals. We never touch your purchase money or pool funds. You pay the dealer directly or via lawyer escrow.
                  </p>
                </div>
              </div>

              <div className="step-card flex flex-col sm:flex-row gap-6 bg-void-light/30 border border-cobalt/50 p-6 rounded-2xl items-start">
                <div className="w-12 h-12 shrink-0 bg-cobalt flex items-center justify-center text-xl font-bold rounded-xl">2</div>
                <div>
                  <h4 className="text-xl font-bold text-crisp-white mb-2">You Appoint Us. We Do The Work.</h4>
                  <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                    Sign a Power of Attorney appointing YUSDAAM AUTOS as your administrator. This lets us legally manage on your behalf. You remain the owner. We become the enforcer.
                  </p>
                </div>
              </div>

              <div className="step-card flex flex-col sm:flex-row gap-6 bg-void-light/30 border border-cobalt/50 p-6 rounded-2xl items-start">
                <div className="w-12 h-12 shrink-0 bg-cobalt flex items-center justify-center text-xl font-bold rounded-xl">3</div>
                <div className="w-full">
                  <h4 className="text-xl font-bold text-crisp-white mb-4">We Vet The Rider — 5-Point Check</h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-light">
                    <div className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-signal-red shrink-0 mt-1" /><span><strong>Home Address:</strong> Verified with family.</span></div>
                    <div className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-signal-red shrink-0 mt-1" /><span><strong>Guarantors:</strong> Secured with property/jobs.</span></div>
                    <div className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-signal-red shrink-0 mt-1" /><span><strong>Park Confirmed:</strong> Chairman verification.</span></div>
                    <div className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-signal-red shrink-0 mt-1" /><span><strong>Police Cleared:</strong> No criminal record.</span></div>
                    <div className="flex gap-2 items-start sm:col-span-2"><CheckCircle2 size={16} className="text-signal-red shrink-0 mt-1" /><span><strong>Work History:</strong> Past bosses confirm previous hire purchase completion.</span></div>
                  </div>
                  <div className="mt-4 text-xs font-bold text-signal-red uppercase tracking-wide">No rider passes without all 5.</div>
                </div>
              </div>

              <div className="step-card flex flex-col sm:flex-row gap-6 bg-void-light/30 border border-cobalt/50 p-6 rounded-2xl items-start">
                <div className="w-12 h-12 shrink-0 bg-cobalt flex items-center justify-center text-xl font-bold rounded-xl">4</div>
                <div className="w-full">
                  <h4 className="text-xl font-bold text-crisp-white mb-2">We Protect & Enforce Daily</h4>
                  <p className="text-slate-light text-sm sm:text-base leading-relaxed mb-4">Before handover, we install <strong>GPS Tracking</strong> (see it 24/7) and an <strong>Immobilizer</strong> (remote shutdown). Then we manage:</p>
                  <ul className="space-y-2 text-sm text-slate-light">
                    <li>• <strong>Weekly Collection:</strong> Rider pays directly to designated account.</li>
                    <li>• <strong>Day-7 Repossession:</strong> Miss payment by 7 days? We recover the vehicle in your name.</li>
                    <li>• <strong>Agbero & Police Issues:</strong> We handle harassment, accidents, and station cases.</li>
                  </ul>
                </div>
              </div>

              <div className="step-card flex flex-col sm:flex-row gap-6 bg-void-light/30 border border-signal-red/50 p-6 rounded-2xl items-start shadow-[0_0_15px_rgba(233,69,96,0.1)]">
                <div className="w-12 h-12 shrink-0 bg-signal-red flex items-center justify-center text-xl font-bold rounded-xl">5</div>
                <div>
                  <h4 className="text-xl font-bold text-crisp-white mb-2">You Receive 100%. We Charge Rider.</h4>
                  <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                    <strong>Your cost: ₦0.</strong> We take no commission, no percentage, no hidden fees from you. You receive the full weekly installment the rider agreed to pay. 
                    <br /><br />
                    <em>If Driver Defaults?</em> We enforce the contract, repossess in your name within 7 days, and place it with a new vetted driver. You don’t chase anyone. We do.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* TRACK RECORD & WHAT WE ARE NOT */}
          <div className="grid lg:grid-cols-2 gap-8 mb-20 scroll-fade">
            <div className="bg-void-navy border border-cobalt p-8 rounded-2xl flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-crisp-white mb-4 flex items-center gap-2"><Shield className="text-signal-red" /> Our Track Record</h3>
              <p className="text-slate-light leading-relaxed mb-6">
                Since 2022, we’ve placed 200+ vehicles on hire purchase. Historical driver performance: <strong>92% weekly payment rate</strong>. 
                <br /><br />
                Past performance does not guarantee future results. Our job is enforcement, not promises.
              </p>
              <div className="text-lg font-bold text-signal-red">
                You didn’t buy a vehicle to become a debt collector. And you shouldn’t pay to avoid it.
              </div>
            </div>

            <div className="bg-void-light/20 border border-slate-light/20 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-crisp-white mb-4 flex items-center gap-2"><FileText className="text-slate-light" /> What We Are Not</h3>
              <p className="text-slate-light text-sm leading-relaxed mb-4">
                We do not pool funds or collect vehicle purchase money. Owners pay dealers directly or via lawyer escrow.
              </p>
              <p className="text-slate-light text-sm leading-relaxed mb-4">
                We do not guarantee driver/rider performance. We guarantee enforcement of the contract. If a driver defaults, we repossess in your name and place the vehicle with a new driver.
              </p>
              <div className="mt-6 pt-6 border-t border-cobalt/30 text-[10px] sm:text-xs text-slate-light/60 uppercase tracking-widest leading-relaxed">
                This document does not constitute investment advice. YUSDAAM AUTOS is not a SEC-licensed fund manager.
              </div>
            </div>
          </div>

          {/* CONTACT SECTION */}
          <div className="bg-cobalt/10 border border-cobalt p-8 rounded-2xl text-center scroll-fade">
            <h3 className="text-xl font-bold text-crisp-white mb-6">Head Office</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-slate-light">
              <div className="flex items-center gap-3">
                <MapPin className="text-signal-red" />
                <span>84, Addo Road, Oke-Ira Kekere, Ajah, Lagos. (Nationwide Service)</span>
              </div>
              <div className="hidden md:block w-px h-8 bg-cobalt"></div>
              <div className="flex flex-col text-sm text-left">
                <span><strong>Call/WhatsApp:</strong> 0906 500 0860</span>
                <span><strong>Hours:</strong> Mon–Sat, 9am–5pm</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
