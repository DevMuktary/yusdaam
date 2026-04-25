"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Car } from "lucide-react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Hold the preloader for 3.5 seconds to let the full animation and text reveal play out
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 800); // Wait for the fade-out exit animation to finish
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Framer Motion variants for the staggered text reveal
  const textContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Delay between each letter
        delayChildren: 1.2,   // Start revealing text after the car has started driving
      },
    },
  };

  const textLetter = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const brandName = "YUSDAAM".split("");

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void-navy"
      initial={{ opacity: 1 }}
      animate={{ opacity: isAnimating ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative w-64 h-40 flex flex-col items-center justify-end">
        
        {/* The Brand Name Reveal */}
        <motion.div 
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="absolute top-0 flex items-center text-4xl md:text-5xl font-bold tracking-[0.2em] text-crisp-white"
        >
          {brandName.map((letter, index) => (
            <motion.span key={index} variants={textLetter}>
              {letter}
            </motion.span>
          ))}
          {/* The signature red dot at the end */}
          <motion.span 
            variants={textLetter} 
            className="text-signal-red ml-1"
          >
            .
          </motion.span>
        </motion.div>

        {/* The Road / Growth Line */}
        <div className="relative w-full h-16 mt-8">
          <motion.svg
            className="absolute inset-0 w-full h-full overflow-visible"
            viewBox="0 0 256 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The path goes straight, then ticks upward like a growth chart */}
            <motion.path
              d="M0 50 L180 50 L256 10"
              stroke="#E94560" // signal-red
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.svg>

          {/* The Driving Vehicle */}
          <motion.div
            className="absolute z-10"
            initial={{ x: -20, y: 35, opacity: 0 }}
            animate={{ x: 240, y: -5, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          >
            <div className="relative">
              <Car size={32} className="text-crisp-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              {/* Red engine glow behind the car */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-signal-red/40 rounded-full blur-xl -z-10" />
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
