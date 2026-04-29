"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldAlert, Crosshair, FileSignature, Map, Wrench, Banknote } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapTextReveal } from "@/hooks/useAnimations";
import { SplitText } from "@/components/ui/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ServicesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const textRef = useGsapTextReveal(0.2);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const sections = gsap.utils.toArray('.scroll-fade');
    sections.forEach((sec: any) => {
      gsap.fromTo(sec, 
        { opacity: 0, y: 30 },
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

    const cards = gsap.utils.toArray('.service-card');
    gsap.fromTo(cards, 
      { opacity: 0, y: 20 },
      {
        opacity: 1, 
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 85%",
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
            <Link href="/about" className="hover:text-crisp-white hover:text-signal-red transition">About Us</Link>
            <Link href="/services" className="text-signal-red transition">Services</Link>
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
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">About Us</Link>
          <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-signal-red">Services</Link>
          <Link href="/quotes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Vehicle Quotes</Link>
          <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 px-8 py-4 bg-signal-red text-crisp-white rounded-xl shadow-lg">
            Asset Owner Portal
          </Link>
        </div>
      </div>

      <div className="pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl">
          
          {/* 1. HERO SECTION */}
          <div className="text-center mb-16 md:mb-24 border-b border-cobalt/20 pb-12 md:pb-20" ref={textRef}>
            <div className="reveal-text inline-flex items-center px-4 py-1.5 rounded-full border border-cobalt/50 text-slate-light text-[10px] sm:text-xs font-bold mb-6 sm:mb-8 tracking-widest uppercase">
              Operations & Logistics
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-crisp-white mb-4 sm:mb-6 uppercase leading-[1.1]">
              <SplitText text="End-to-End" /> <br />
              <span className="text-signal-red"><SplitText text="Asset Management." /></span>
            </h1>
            <p className="reveal-text text-base sm:text-xl text-slate-light leading-relaxed font-medium max-w-3xl mx-auto mt-6 sm:mt-8">
              From the moment the vehicle leaves the dealership to the final installment payment, we manage the driver, the streets, and the contract enforcement so you don't have to.
            </p>
          </div>

          {/* 2. THE CORE SERVICES GRID */}
          <div className="mb-16 md:mb-32 scroll-fade">
            <h2 className="text-2xl sm:text-3xl font-black text-crisp-white mb-8 sm:mb-12 text-center uppercase tracking-wider">Our Operational Blueprint</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 services-grid">
              
              {/* Service 1 */}
              <div className="service-card bg-void-light/10 border border-cobalt/30 p-6 sm:p-8 rounded-2xl hover:border-signal-red/50 transition-colors duration-300">
                <FileSignature className="text-cobalt w-10 h-10 sm:w-12 sm:h-12 mb-6" />
                <h3 className="text-xl font-bold text-crisp-white mb-3">Legal Structuring</h3>
                <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                  We draft and execute binding Hire Purchase Agreements between your appointed administrator entity and the vetted driver. The vehicle remains fully in your name.
                </p>
              </div>

              {/* Service 2 */}
              <div className="service-card bg-void-light/10 border border-cobalt/30 p-6 sm:p-8 rounded-2xl hover:border-signal-red/50 transition-colors duration-300">
                <Map className="text-cobalt w-10 h-10 sm:w-12 sm:h-12 mb-6" />
                <h3 className="text-xl font-bold text-crisp-white mb-3">GPS & Immobilization</h3>
                <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                  Every asset is fitted with enterprise-grade tracking systems. We monitor geo-fenced routes 24/7 and maintain the ability to shut down the engine remotely via our control center.
                </p>
              </div>

              {/* Service 3 */}
              <div className="service-card bg-void-light/10 border border-cobalt/30 p-6 sm:p-8 rounded-2xl hover:border-signal-red/50 transition-colors duration-300">
                <ShieldAlert className="text-cobalt w-10 h-10 sm:w-12 sm:h-12 mb-6" />
                <h3 className="text-xl font-bold text-crisp-white mb-3">Street-Level Liaison</h3>
                <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                  Lagos streets are unpredictable. Our field team directly handles park union (Agbero) disputes, police checkpoints, LASTMA clearings, and municipal tax compliance.
                </p>
              </div>

              {/* Service 4 */}
              <div className="service-card bg-void-light/10 border border-cobalt/30 p-6 sm:p-8 rounded-2xl hover:border-signal-red/50 transition-colors duration-300">
                <Banknote className="text-cobalt w-10 h-10 sm:w-12 sm:h-12 mb-6" />
                <h3 className="text-xl font-bold text-crisp-white mb-3">Remittance Administration</h3>
                <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                  We enforce the collection of weekly installments from the driver. These funds are consolidated and routed directly to the asset owner's designated bank account weekly.
                </p>
              </div>

              {/* Service 5 */}
              <div className="service-card bg-void-light/10 border border-cobalt/30 p-6 sm:p-8 rounded-2xl hover:border-signal-red/50 transition-colors duration-300">
                <Wrench className="text-cobalt w-10 h-10 sm:w-12 sm:h-12 mb-6" />
                <h3 className="text-xl font-bold text-crisp-white mb-3">Maintenance Oversight</h3>
                <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                  While repair costs fall strictly on the driver, we enforce mandatory routine checkups at affiliated garages to ensure the asset is not being degraded or stripped of parts.
                </p>
              </div>

              {/* Service 6 */}
              <div className="service-card bg-void-light/10 border border-signal-red/40 p-6 sm:p-8 rounded-2xl shadow-[0_0_15px_rgba(233,69,96,0.1)]">
                <Crosshair className="text-signal-red w-10 h-10 sm:w-12 sm:h-12 mb-6" />
                <h3 className="text-xl font-bold text-crisp-white mb-3">Recovery & Repossession</h3>
                <p className="text-slate-light text-sm sm:text-base leading-relaxed">
                  If a driver misses a payment by 7 days, our Day-7 Protocol activates. The engine is immobilized, the physical asset is recovered by our field team, and the vehicle is reassigned.
                </p>
              </div>

            </div>
          </div>

          {/* 3. THE "NOT A FINANCIAL PRODUCT" ENFORCEMENT CLAUSE */}
          <div className="bg-void-navy border-2 border-cobalt p-8 sm:p-12 md:p-16 rounded-2xl text-center mb-16 md:mb-32 scroll-fade">
            <h3 className="text-sm font-bold tracking-widest text-signal-red uppercase mb-6">Important Disclosure</h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-crisp-white mb-8 tracking-tight">We Guarantee Enforcement. <br className="hidden md:block" /> Not Human Behavior.</h2>
            <div className="max-w-4xl mx-auto space-y-6 text-slate-light text-base sm:text-lg leading-relaxed text-left md:text-center">
              <p>
                YUSDAAM AUTOS is an operational logistics and asset administration company. We do not sell financial instruments, nor do we offer guaranteed returns on investment. 
              </p>
              <p>
                Drivers are humans, and defaults can occur. Our value is not in promising that a driver will never default. Our value lies in our <strong>ruthless enforcement protocols</strong>. If a default occurs, you do not lose your asset, and you do not have to confront the driver. We execute the recovery and replace the operator.
              </p>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link href="/quotes" className="px-8 py-4 bg-signal-red text-crisp-white font-bold rounded-xl hover:bg-signal-red/90 transition shadow-lg w-full sm:w-auto">
                View Vehicle Quotes
              </Link>
              <a href="tel:09065000860" className="px-8 py-4 bg-transparent border-2 border-slate-light/30 hover:border-slate-light text-crisp-white font-bold rounded-xl transition w-full sm:w-auto">
                Speak With Administration
              </a>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
