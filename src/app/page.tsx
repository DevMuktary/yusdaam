"use client";

import { useState } from "react";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import TheEngine from "@/components/TheEngine";
import RiderCall from "@/components/RiderCall";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    // STRICT OVERFLOW CONTROL ADDED HERE TO PREVENT SIDE DRAGGING
    <main className="bg-void-navy min-h-screen text-crisp-white overflow-x-hidden w-full max-w-[100vw]">
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      
      <div 
        className={`transition-opacity duration-1000 w-full ${isLoading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}
      >
        <nav className="absolute top-0 w-full z-50 px-4 sm:px-6 py-4 sm:py-6 border-b border-cobalt/20 bg-void-navy/80 backdrop-blur-md">
          <div className="container mx-auto flex justify-between items-center">
            
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-wider hover:opacity-80 transition">
              YUSDAAM<span className="text-signal-red">.</span>
            </Link>
            
            <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-light tracking-wide uppercase">
              <Link href="/" className="hover:text-crisp-white hover:text-signal-red transition">Home</Link>
              <Link href="/about" className="hover:text-crisp-white hover:text-signal-red transition">About Us</Link>
              <Link href="/services" className="hover:text-crisp-white hover:text-signal-red transition">Services</Link>
              <Link href="/invest" className="hover:text-crisp-white hover:text-signal-red transition">Invest</Link>
            </div>
            
            <Link 
              href="/auth/login"
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold bg-cobalt border border-cobalt hover:border-slate-light/50 text-crisp-white rounded-lg hover:bg-void-light transition shadow-lg"
            >
              Investor Portal
            </Link>
            
          </div>
        </nav>

        <Hero />
        <TheEngine />
        <RiderCall />
        
      </div>
    </main>
  );
}
