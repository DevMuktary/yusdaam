"use strict";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-void-navy">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cobalt/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Column: Text & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/30 border border-cobalt text-signal-red text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
            100% Risk-Free Investment
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-crisp-white leading-tight mb-6">
            Invest in <br />
            <span className="text-slate-light">Lagos Transport.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-light/80 mb-10 leading-relaxed max-w-xl">
            We handle the riders, the maintenance, and the street-level operations. You get guaranteed weekly returns backed by a concrete agreement. No Agberos. No stories.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-signal-red hover:bg-signal-red/90 text-crisp-white font-semibold rounded-lg transition-all shadow-[0_0_20px_rgba(233,69,96,0.3)]">
              Get an Investment Proposal
            </button>
            <button className="px-8 py-4 bg-transparent border border-slate-light/20 hover:border-slate-light/50 hover:bg-void-light text-crisp-white font-semibold rounded-lg transition-all">
              View Vehicle Portfolios
            </button>
          </div>
        </motion.div>

        {/* Right Column: Premium Imagery */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative hidden lg:block h-[600px] w-full"
        >
          {/* Placeholder for your premium image. 
            Create a "public/images" folder and add a file named "hero-fleet.png".
            This should be a high-end, color-graded image of a clean Keke or Uber car on a Lagos road at night.
          */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden border border-cobalt/30 shadow-2xl bg-void-light">
             {/* Uncomment this once you have the image in your public folder */}
             {/* <Image 
               src="/images/hero-fleet.png" 
               alt="Premium Lagos Transport Fleet" 
               fill 
               className="object-cover opacity-80 mix-blend-luminosity"
               priority
             /> */}
             
             {/* Temporary placeholder styling until image is added */}
             <div className="w-full h-full flex items-center justify-center text-cobalt font-bold text-2xl">
                [INSERT HIGH-END FLEET IMAGE HERE]
             </div>
             
             {/* Overlay Gradient to blend image into the dark background */}
             <div className="absolute inset-0 bg-gradient-to-t from-void-navy via-void-navy/20 to-transparent" />
          </div>

          {/* Floating Trust Badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 bg-void-light border border-cobalt p-6 rounded-xl shadow-xl backdrop-blur-md"
          >
            <div className="text-signal-red font-bold text-3xl">₦<span className="text-crisp-white">Guaranteed</span></div>
            <div className="text-slate-light text-sm mt-1">Weekly Remittances</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
