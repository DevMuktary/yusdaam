"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Car } from "lucide-react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Hold the preloader for 2.5 seconds
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500); // Wait for fade out to finish before unmounting
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy"
      initial={{ opacity: 1 }}
      animate={{ opacity: isAnimating ? 1 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="relative w-64 h-32 flex items-end">
        {/* The Growth Line Path */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 256 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M0 110 L100 110 L150 80 L200 40 L256 10"
            stroke="#E94560" // Signal Red
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.svg>

        {/* The Driving Vehicle Icon */}
        <motion.div
          className="absolute text-crisp-white"
          initial={{ x: 0, y: 110, opacity: 0 }}
          animate={{ x: 240, y: 10, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <div className="relative -top-6 -left-3">
            <Car size={28} className="text-crisp-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-signal-red/30 rounded-full blur-md -z-10" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
