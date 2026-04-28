"use client";

import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const vehicles = [
  {
    id: 1,
    name: "Tricycle (Keke)",
    tag: "High Demand",
    description: "The absolute backbone of Lagos short-distance transit. Incredible daily turnover with minimal downtime.",
    image: "/images/showcase-tricycle.png",
  },
  {
    id: 2,
    name: "Uber / Bolt Sedan",
    tag: "Premium Commute",
    description: "Sleek, air-conditioned city transit. Highly regulated and paired only with top-tier, verified platform drivers.",
    image: "/images/showcase-uber.png",
  },
  {
    id: 3,
    name: "Mini-Bus (Korope)",
    tag: "Mass Transit",
    description: "The perfect middle-ground for moving small crowds quickly across dense urban routes.",
    image: "/images/showcase-minibus.png",
  },
  {
    id: 4,
    name: "Long-Bus",
    tag: "Heavy Volume",
    description: "Designed for inter-city or major highway transit. Slower wear-and-tear with massive daily passenger volume.",
    image: "/images/showcase-longbus.png",
  },
  {
    id: 5,
    name: "Tipper Truck",
    tag: "Industrial Grade",
    description: "Pure industrial power. Leased for construction and aggregate hauling. High capital, high remittance.",
    image: "/images/showcase-tipper.png",
  }
];

export default function VehicleShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intro Animation
  useGSAP(() => {
    gsap.fromTo(sectionRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: sectionRef.current, start: "top 85%" } }
    );
  }, { scope: sectionRef });

  // 3D Tilt Effect logic for Desktop
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10 degrees
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.5
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      ease: "elastic.out(1, 0.3)",
      duration: 1.5
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1));
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-void-navy relative overflow-hidden w-full">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        
        <div className="text-center mb-12">
          <h2 className="text-xs sm:text-sm font-bold tracking-widest text-signal-red uppercase mb-3">Asset Classes</h2>
          <h3 className="text-3xl md:text-5xl font-black text-crisp-white">Select Your Workhorse.</h3>
          <p className="mt-4 text-slate-light max-w-2xl mx-auto text-sm md:text-base">
            Browse our managed asset categories. We match the perfect vehicle to the most profitable routes in Lagos.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          
          {/* Text Side (Controls Removed from here) */}
          <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
            <div className="inline-block px-4 py-1.5 rounded-full bg-cobalt/30 border border-cobalt text-signal-red text-xs font-bold uppercase tracking-widest mb-6">
              {vehicles[currentIndex].tag}
            </div>
            
            <h4 className="text-3xl md:text-4xl font-black text-crisp-white mb-4 h-12 lg:h-auto">
              {vehicles[currentIndex].name}
            </h4>
            
            <p className="text-slate-light text-base md:text-lg leading-relaxed h-24 lg:h-auto">
              {vehicles[currentIndex].description}
            </p>
          </div>

          {/* 3D Image Display Side with Floating Controls */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2 relative perspective-[1000px]">
            
            {/* The 3D Image Card */}
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full aspect-[4/3] md:aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden border-2 border-cobalt/50 shadow-[0_20px_50px_rgba(15,52,96,0.5)] cursor-grab active:cursor-grabbing"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Image 
                src={vehicles[currentIndex].image}
                alt={vehicles[currentIndex].name}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              
              {/* Premium dark gradient overlay so the buttons stand out */}
              <div className="absolute inset-0 bg-gradient-to-t from-void-navy/90 via-transparent to-transparent opacity-80 pointer-events-none" />
            </div>

            {/* Floating Navigation Controls - Pinned to the Bottom Right of the Image */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-3 bg-void-navy/85 backdrop-blur-md p-2 sm:p-2.5 rounded-full border border-cobalt/50 shadow-2xl">
              <button 
                onClick={prevSlide}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-void-light border border-cobalt flex items-center justify-center text-crisp-white hover:bg-signal-red hover:border-signal-red transition-all shadow-lg active:scale-95"
                aria-label="Previous Vehicle"
              >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              
              <div className="text-slate-light font-bold text-xs sm:text-sm tracking-widest text-center min-w-[3rem]">
                0{currentIndex + 1} <span className="mx-1 text-cobalt">/</span> 0{vehicles.length}
              </div>

              <button 
                onClick={nextSlide}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-void-light border border-cobalt flex items-center justify-center text-crisp-white hover:bg-signal-red hover:border-signal-red transition-all shadow-lg active:scale-95"
                aria-label="Next Vehicle"
              >
                <ChevronRight size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
