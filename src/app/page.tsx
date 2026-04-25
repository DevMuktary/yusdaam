"use client";

import { useState } from "react";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="bg-void-navy min-h-screen text-crisp-white">
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      
      {/* Content fades in after preloader */}
      <div 
        className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}
      >
        {/* Navbar placeholder */}
        <nav className="absolute top-0 w-full z-50 px-6 py-6 border-b border-cobalt/20 bg-void-navy/80 backdrop-blur-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold tracking-wider">YUSDAAM<span className="text-signal-red">.</span></div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-slate-light">
              <span className="cursor-pointer hover:text-crisp-white transition">Home</span>
              <span className="cursor-pointer hover:text-crisp-white transition">About Us</span>
              <span className="cursor-pointer hover:text-crisp-white transition">Services</span>
              <span className="cursor-pointer hover:text-crisp-white transition">Invest</span>
            </div>
            <button className="px-5 py-2 text-sm font-semibold bg-cobalt text-crisp-white rounded hover:bg-cobalt/80 transition">
              Login Portal
            </button>
          </div>
        </nav>

        <Hero />
        
        {/* The rest of the homepage sections will go here */}
      </div>
    </main>
  );
}
