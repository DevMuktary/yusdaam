"use client";

import { useState } from "react";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import VehicleShowcase from "@/components/VehicleShowcase"; 
import TheEngine from "@/components/TheEngine";
import RiderCall from "@/components/RiderCall";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

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
            
            <Link href="/" className="z-[70] block hover:opacity-80 transition">
              <Image 
                src="/images/logo2.PNG" 
                alt="Yusdaam Autos Logo" 
                width={180} 
                height={50} 
                /* RESTORED: h-8 and h-10 keeps the blue nav small. 
                   ADDED: scale-[1.4] and sm:scale-[1.7] enlarges the logo visually.
                   ADDED: origin-left ensures it scales to the right, not off the screen. */
                className="object-contain h-8 sm:h-10 w-auto scale-[1.4] sm:scale-[1.7] origin-left" 
                priority
              />
            </Link>
            
            {/* Desktop Links */}
            <div className="hidden lg:flex gap-8 text-sm font-semibold text-slate-light tracking-wide uppercase items-center">
              <Link href="/" className="hover:text-crisp-white hover:text-signal-red transition">Home</Link>
              <Link href="/about" className="hover:text-crisp-white hover:text-signal-red transition">About Us</Link>
              <Link href="/services" className="hover:text-crisp-white hover:text-signal-red transition">Services</Link>
              <Link href="/quotes" className="hover:text-crisp-white hover:text-signal-red transition">Vehicle Quotes</Link>
            </div>
            
            {/* Desktop Portal Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link 
                href="/owner/register"
                className="px-5 py-2.5 text-sm font-bold bg-transparent border border-slate-light/30 hover:border-crisp-white text-crisp-white rounded-lg transition"
              >
                Register
              </Link>
              <Link 
                href="/owner/login"
                className="px-6 py-2.5 text-sm font-bold bg-cobalt border border-cobalt hover:border-slate-light/50 text-crisp-white rounded-lg hover:bg-void-light transition shadow-lg"
              >
                Owner Login
              </Link>
            </div>

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
          <div className="flex flex-col gap-6 text-center text-lg font-bold text-slate-light uppercase tracking-widest w-full px-8">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Home</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">About Us</Link>
            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Services</Link>
            <Link href="/quotes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-signal-red">Vehicle Quotes</Link>
            
            <div className="w-full h-px bg-white/10 my-2"></div>
            
            <Link 
              href="/owner/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-8 py-3 border border-slate-light/30 text-crisp-white rounded-xl"
            >
              Register as Owner
            </Link>
            <Link 
              href="/owner/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-8 py-4 bg-signal-red text-crisp-white rounded-xl shadow-lg"
            >
              Owner Login
            </Link>
            <Link 
              href="/rider/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 text-sm text-slate-light hover:text-signal-red normal-case"
            >
              Looking to drive? Apply as a Driver
            </Link>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="pt-16 sm:pt-20">
          <Hero />
          <VehicleShowcase />
          <TheEngine />
          <RiderCall />
        </div>
        
      </div>
    </main>
  );
}
