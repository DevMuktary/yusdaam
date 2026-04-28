"use client";

import { useState } from "react";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import TheEngine from "@/components/TheEngine";
import RiderCall from "@/components/RiderCall";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Importing icons for the mobile menu

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="bg-void-navy min-h-screen text-crisp-white overflow-x-hidden w-full max-w-[100vw]">
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      
      <div className={`transition-opacity duration-1000 w-full ${isLoading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}>
        
        {/* DESKTOP & MOBILE NAVBAR */}
        <nav className="fixed top-0 w-full z-[60] px-4 sm:px-6 py-4 border-b border-cobalt/20 bg-void-navy/90 backdrop-blur-md">
          <div className="container mx-auto flex justify-between items-center">
            
            <Link href="/" className="text-xl sm:text-2xl font-black tracking-wider hover:opacity-80 transition z-[70]">
              YUSDAAM<span className="text-signal-red">.</span>
            </Link>
            
            {/* Desktop Links */}
            <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-light tracking-wide uppercase items-center">
              <Link href="/" className="hover:text-crisp-white hover:text-signal-red transition">Home</Link>
              <Link href="/about" className="hover:text-crisp-white hover:text-signal-red transition">About Us</Link>
              <Link href="/services" className="hover:text-crisp-white hover:text-signal-red transition">Services</Link>
              <Link href="/quotes" className="hover:text-crisp-white hover:text-signal-red transition">Vehicle Quotes</Link>
            </div>
            
            {/* Desktop Portal Button */}
            <Link 
              href="/auth/login"
              className="hidden md:inline-flex px-6 py-2.5 text-sm font-bold bg-cobalt border border-cobalt hover:border-slate-light/50 text-crisp-white rounded-lg hover:bg-void-light transition shadow-lg"
            >
              Asset Owner Portal
            </Link>

            {/* Mobile Hamburger Button */}
            <button 
              className="md:hidden text-crisp-white z-[70]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>

        {/* MOBILE SIDEBAR MENU */}
        <div className={`fixed inset-0 bg-void-navy/95 backdrop-blur-xl z-[50] flex flex-col items-center justify-center transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col gap-8 text-center text-lg font-bold text-slate-light uppercase tracking-widest">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Home</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">About Us</Link>
            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Services</Link>
            <Link href="/quotes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Vehicle Quotes</Link>
            
            <Link 
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 px-8 py-4 bg-signal-red text-crisp-white rounded-xl shadow-lg"
            >
              Asset Owner Portal
            </Link>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="pt-16"> {/* Offset for the fixed navbar */}
          <Hero />
          <TheEngine />
          <RiderCall />
        </div>
        
      </div>
    </main>
  );
}
