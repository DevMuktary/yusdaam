"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, Shield, AlertTriangle, Check, MapPin, FileText } from "lucide-react";
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
        { opacity: 0, y: 20 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 85%",
          }
        }
      );
    });

    const steps = gsap.utils.toArray('.step-card');
    gsap.fromTo(steps, 
      { opacity: 0, x: -15 },
      {
        opacity: 1, 
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".steps-container",
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <main className="bg-[#001232] min-h-screen text-white overflow-x-hidden w-full max-w-[100vw]" ref={containerRef}>
      
      {/* EXECUTIVE NAVBAR */}
      <nav className="fixed top-0 w-full z-[60] px-4 sm:px-6 py-4 border-b border-gray-800 bg-[#001232]/95 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-black tracking-widest hover:text-[#FFB902] transition z-[70] uppercase">
            Yusdaam<span className="text-[#FFB902]">.</span>
          </Link>
          
          <div className="hidden md:flex gap-8 text-xs font-bold text-gray-400 tracking-widest uppercase items-center">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/about" className="text-[#FFB902]">About Us</Link>
            <Link href="/services" className="hover:text-white transition">Services</Link>
            <Link href="/quotes" className="hover:text-white transition">Vehicle Quotes</Link>
          </div>
          
          <Link href="/auth/login" className="hidden md:inline-flex px-8 py-3 text-xs font-bold bg-[#FFB902] text-[#001232] uppercase tracking-widest hover:bg-white transition-colors">
            Asset Owner Portal
          </Link>

          <button className="md:hidden text-white z-[70]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-[#001232] z-[50] flex flex-col items-center justify-center transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col gap-8 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#FFB902]">Home</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-[#FFB902]">About Us</Link>
          <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#FFB902]">Services</Link>
          <Link href="/quotes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#FFB902]">Vehicle Quotes</Link>
          <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-8 px-8 py-4 bg-[#FFB902] text-[#001232]">
            Asset Owner Portal
          </Link>
        </div>
      </div>

      <div className="pt-32 md:pt-40 pb-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          
          {/* CORPORATE HERO */}
          <div className="max-w-4xl mx-auto text-center mb-24" ref={textRef}>
            <div className="reveal-text inline-block px-4 py-2 border border-[#FFB902] text-[#FFB902] text-[10px] font-bold mb-8 tracking-[0.2em] uppercase">
              RC 9335611
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase leading-none">
              <SplitText text="Hire Purchase" /> <br />
              <span className="text-[#FFB902]"><SplitText text="Administrators." /></span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-500 uppercase tracking-widest mb-8">
              Not Fund Managers.
            </h2>
            <p className="reveal-text text-base sm:text-lg text-gray-300 leading-relaxed font-medium max-w-2xl mx-auto">
              YUSDAAM AUTOS provides hire purchase administration for vehicle owners across Nigeria. We manage Tricycles, Cars for Uber/Bolt, Motorcycles, Mini-Buses, and Tipper Trucks.
            </p>
          </div>

          {/* PROBLEM VS SOLUTION - SHARP GRID */}
          <div className="grid md:grid-cols-2 gap-px bg-gray-800 mb-24 scroll-fade border border-gray-800">
            <div className="bg-[#001232] p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle size={20} className="text-gray-500" />
                <h3 className="text-xl font-black uppercase tracking-widest text-white">The Problem</h3>
              </div>
              <p className="text-gray-400 text-sm md:text-base leading-loose">
                You purchase a vehicle to earn from transport. But reality hits: drivers give excuses, vehicles go untraceable, repairs drain your income, and agbero harassment kills collection. 
                <br /><br />
                Most owners lack the time, legal structure, or street enforcement to manage riders. <strong className="text-white">Result: 70% sell at a loss within 8 months.</strong>
              </p>
            </div>

            <div className="bg-[#001232] p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute inset-0 border-l-4 border-[#FFB902]" />
              <div className="flex items-center gap-4 mb-6">
                <Shield size={20} className="text-[#FFB902]" />
                <h3 className="text-xl font-black uppercase tracking-widest text-[#FFB902]">Our Solution</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base leading-loose">
                <strong className="text-white">You Own. We Enforce. Zero Fees To You.</strong>
                <br /><br />
                You buy the vehicle in your name and appoint us through a Power of Attorney. We handle vetting drivers, signing Hire Purchase Agreements, installing GPS + immobilizers, and enforcing weekly installments. 
                <br /><br />
                We deal with police, agberos, defaults, and excuses. You don’t.
              </p>
            </div>
          </div>

          {/* THE ₦0 MANDATE */}
          <div className="border border-[#FFB902] bg-[#001232] p-10 sm:p-16 text-center mb-24 scroll-fade relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#001232] px-4 text-[#FFB902] text-[10px] font-bold tracking-[0.2em] uppercase">
              How We Get Paid
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 uppercase tracking-tight">You Pay Us ₦0.</h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-3xl mx-auto leading-loose">
              Our service is 100% free to vehicle owners. We charge drivers/riders a small daily service fee for management, tracking, and support. Since we source the rider and do the work, the rider pays for the service, not you. All running costs, fuel, repairs, and levies remain the driver's responsibility under the Hire Purchase Agreement.
            </p>
          </div>

          {/* THE 5 STEPS - CORPORATE LEDGER STYLE */}
          <div className="mb-32">
            <div className="mb-16 scroll-fade border-b border-gray-800 pb-6">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#FFB902] uppercase mb-2">How It Works</h3>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest">The Administration Process</h2>
            </div>

            <div className="grid gap-0 border-l border-gray-800 ml-4 md:ml-0 steps-container">
              
              <div className="step-card relative pl-8 md:pl-12 pb-12">
                <div className="absolute left-[-16px] top-0 w-8 h-8 bg-[#001232] border border-[#FFB902] text-[#FFB902] flex items-center justify-center text-xs font-bold font-mono">01</div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-3 uppercase tracking-wider">You Buy The Vehicle. Keep 100% Ownership.</h4>
                <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                  You purchase the vehicle directly from the dealer. All papers carry your name only. You hold the originals. We never touch your purchase money or pool funds. You pay the dealer directly or via lawyer escrow.
                </p>
              </div>

              <div className="step-card relative pl-8 md:pl-12 pb-12">
                <div className="absolute left-[-16px] top-0 w-8 h-8 bg-[#001232] border border-[#FFB902] text-[#FFB902] flex items-center justify-center text-xs font-bold font-mono">02</div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-3 uppercase tracking-wider">You Appoint Us. We Do The Work.</h4>
                <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                  Sign a Power of Attorney appointing YUSDAAM AUTOS as your administrator. This lets us legally manage on your behalf. You remain the owner. We become the enforcer.
                </p>
              </div>

              <div className="step-card relative pl-8 md:pl-12 pb-12">
                <div className="absolute left-[-16px] top-0 w-8 h-8 bg-[#001232] border border-[#FFB902] text-[#FFB902] flex items-center justify-center text-xs font-bold font-mono">03</div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-6 uppercase tracking-wider">We Vet The Rider — 5-Point Check</h4>
                <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-400 max-w-4xl">
                  <div className="flex gap-3 items-start border-b border-gray-800 pb-3"><Check size={14} className="text-[#FFB902] shrink-0 mt-0.5" /><span><strong className="text-white uppercase text-xs tracking-wider block mb-1">Home Address</strong> Verified with family.</span></div>
                  <div className="flex gap-3 items-start border-b border-gray-800 pb-3"><Check size={14} className="text-[#FFB902] shrink-0 mt-0.5" /><span><strong className="text-white uppercase text-xs tracking-wider block mb-1">Guarantors</strong> Secured with property/jobs.</span></div>
                  <div className="flex gap-3 items-start border-b border-gray-800 pb-3"><Check size={14} className="text-[#FFB902] shrink-0 mt-0.5" /><span><strong className="text-white uppercase text-xs tracking-wider block mb-1">Park Confirmed</strong> Chairman verification.</span></div>
                  <div className="flex gap-3 items-start border-b border-gray-800 pb-3"><Check size={14} className="text-[#FFB902] shrink-0 mt-0.5" /><span><strong className="text-white uppercase text-xs tracking-wider block mb-1">Police Cleared</strong> No criminal record.</span></div>
                  <div className="flex gap-3 items-start sm:col-span-2 pt-2"><Check size={14} className="text-[#FFB902] shrink-0 mt-0.5" /><span><strong className="text-white uppercase text-xs tracking-wider block mb-1">Work History</strong> Past bosses confirm previous hire purchase completion.</span></div>
                </div>
                <div className="mt-6 text-[10px] font-bold text-[#FFB902] uppercase tracking-[0.2em] border border-[#FFB902] inline-block px-3 py-1">No rider passes without all 5.</div>
              </div>

              <div className="step-card relative pl-8 md:pl-12 pb-12">
                <div className="absolute left-[-16px] top-0 w-8 h-8 bg-[#001232] border border-[#FFB902] text-[#FFB902] flex items-center justify-center text-xs font-bold font-mono">04</div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-4 uppercase tracking-wider">We Protect & Enforce Daily</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-3xl">Before handover, we install <strong className="text-white">GPS Tracking</strong> and an <strong className="text-white">Immobilizer</strong> (remote shutdown). Then we manage:</p>
                <div className="bg-gray-900/50 p-6 border border-gray-800 max-w-3xl">
                  <ul className="space-y-4 text-sm text-gray-400">
                    <li className="flex gap-4"><span className="text-[#FFB902] font-mono">/</span> <div><strong className="text-white tracking-wide">Weekly Collection:</strong> Rider pays directly to designated account.</div></li>
                    <li className="flex gap-4"><span className="text-[#FFB902] font-mono">/</span> <div><strong className="text-white tracking-wide">Day-7 Repossession:</strong> Miss payment by 7 days? We recover the vehicle.</div></li>
                    <li className="flex gap-4"><span className="text-[#FFB902] font-mono">/</span> <div><strong className="text-white tracking-wide">Agbero & Police Issues:</strong> We handle harassment, accidents, and station cases.</div></li>
                  </ul>
                </div>
              </div>

              <div className="step-card relative pl-8 md:pl-12">
                <div className="absolute left-[-16px] top-0 w-8 h-8 bg-[#FFB902] text-[#001232] flex items-center justify-center text-xs font-black font-mono">05</div>
                <h4 className="text-lg md:text-xl font-black text-[#FFB902] mb-3 uppercase tracking-wider">You Receive 100%. We Charge Rider.</h4>
                <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">
                  <strong className="text-white">Your cost: ₦0.</strong> We take no commission, no percentage, no hidden fees from you. You receive the full weekly installment the rider agreed to pay. 
                  <br /><br />
                  <span className="text-gray-500 uppercase text-xs tracking-widest block mb-1">If Driver Defaults?</span> We enforce the contract, repossess in your name within 7 days, and place it with a new vetted driver. You don’t chase anyone. We do.
                </p>
              </div>

            </div>
          </div>

          {/* TRACK RECORD & LEGAL DISCLAIMER */}
          <div className="grid lg:grid-cols-2 gap-px bg-gray-800 mb-20 scroll-fade border border-gray-800">
            <div className="bg-[#001232] p-8 md:p-12">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest border-b border-gray-800 pb-4 flex items-center justify-between">
                Our Track Record
                <Shield size={16} className="text-gray-600" />
              </h3>
              <p className="text-gray-400 text-sm leading-loose mb-8">
                Since 2022, we’ve placed 200+ vehicles on hire purchase. Historical driver performance: <strong className="text-white">92% weekly payment rate</strong>. Past performance does not guarantee future results. Our job is enforcement, not promises.
              </p>
              <div className="text-sm font-black text-[#FFB902] uppercase tracking-wide leading-relaxed border-l-2 border-[#FFB902] pl-4">
                You didn’t buy a vehicle to become a debt collector. And you shouldn’t pay to avoid it.
              </div>
            </div>

            <div className="bg-gray-900 p-8 md:p-12">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest border-b border-gray-800 pb-4 flex items-center justify-between">
                What We Are Not
                <FileText size={16} className="text-gray-600" />
              </h3>
              <ul className="space-y-6 text-sm text-gray-400 leading-loose">
                <li>We do not pool funds or collect vehicle purchase money. Owners pay dealers directly or via lawyer escrow.</li>
                <li>We do not guarantee driver/rider performance. We guarantee enforcement of the contract. If a driver defaults, we repossess in your name and place the vehicle with a new driver.</li>
              </ul>
              <div className="mt-8 pt-4 border-t border-gray-800 text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">
                This document does not constitute investment advice. YUSDAAM AUTOS is not a SEC-licensed fund manager.
              </div>
            </div>
          </div>

          {/* CONTACT HEADQUARTERS */}
          <div className="border border-gray-800 p-8 md:p-12 text-center scroll-fade">
            <h3 className="text-[10px] font-bold text-gray-500 mb-6 uppercase tracking-[0.2em]">Headquarters</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-gray-300">
              <div className="flex items-center gap-4 text-sm">
                <MapPin size={16} className="text-[#FFB902]" />
                <span className="text-left">84, Addo Road, Oke-Ira Kekere,<br/>Ajah, Lagos. (Nationwide Service)</span>
              </div>
              <div className="hidden md:block w-px h-12 bg-gray-800"></div>
              <div className="flex flex-col text-sm text-left gap-1 font-mono">
                <span>TEL: <span className="text-white">0906 500 0860</span></span>
                <span>HRS: <span className="text-white">MON–SAT, 9AM–5PM</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
