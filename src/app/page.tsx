"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, TrendingUp, Car, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Simulate pre-loader duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2800); // 2.8 seconds for the animation to play out
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader key="preloader" />}
      </AnimatePresence>

      {/* Main Content - Only visible after loader fades */}
      {!loading && (
        <main className="min-h-screen bg-void-navy overflow-hidden">
          <HeroSection />
          <GuaranteeSection />
          <ProblemSolutionSection />
          <VehiclePortfolioSection />
        </main>
      )}
    </>
  );
}

// ==========================================
// 1. THE PRELOADER (The "Drive to Growth")
// ==========================================
function Preloader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy"
    >
      <div className="relative w-64 h-32 flex items-center justify-center">
        {/* The glowing red line that moves like a vehicle then shoots up like a chart */}
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 200 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M 10 80 L 80 80 L 110 40 L 140 60 L 190 10"
            stroke="#E94560" // Signal Red
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            style={{ filter: "drop-shadow(0px 0px 8px #E94560)" }}
          />
        </motion.svg>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute -bottom-8 text-slate-light font-medium tracking-widest text-sm"
        >
          INITIALIZING PORTFOLIO...
        </motion.p>
      </div>
    </motion.div>
  );
}

// ==========================================
// 2. HERO SECTION
// ==========================================
function HeroSection() {
  // Staggered animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20">
      {/* Abstract Background Glow */}
      <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-cobalt/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-signal-red/5 rounded-full blur-[100px] -z-10" />

      <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-4xl">
        <motion.div variants={itemVars} className="flex items-center gap-2 mb-6 text-signal-red font-semibold tracking-wide text-sm uppercase">
          <MapPin size={18} />
          <span>Premium Fleet Management • Lagos State</span>
        </motion.div>

        <motion.h1 variants={itemVars} className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-crisp-white">
          Don't Leave Your Asset <br />
          <span className="text-slate-light">To Chance.</span>
        </motion.h1>

        <motion.p variants={itemVars} className="text-lg md:text-xl text-slate-light mb-10 max-w-2xl leading-relaxed">
          YUSDAAM Autos offers a solution for investors who want to tap into the lucrative Lagos transportation sector without the hassle of direct management. You buy the vehicle; we handle the rest.
        </motion.p>

        <motion.div variants={itemVars} className="flex flex-col sm:flex-row gap-4">
          <button className="flex items-center justify-center gap-2 px-8 py-4 bg-signal-red hover:bg-[#D63D54] text-crisp-white font-semibold rounded-lg transition-colors group">
            Get an Investment Proposal
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-void-light border border-cobalt hover:bg-cobalt text-crisp-white font-semibold rounded-lg transition-colors">
            View Portfolios
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ==========================================
// 3. ZERO-RISK GUARANTEE
// ==========================================
function GuaranteeSection() {
  const features = [
    {
      icon: <ShieldCheck size={32} className="text-signal-red" />,
      title: "100% Risk Assumption",
      desc: "If the vehicle faces operational issues, your returns remain untouched. We assume full accountability.",
    },
    {
      icon: <TrendingUp size={32} className="text-signal-red" />,
      title: "Guaranteed Weekly Returns",
      desc: "Consistent income remitted directly to your account, backed by a concrete, signed agreement.",
    },
    {
      icon: <Car size={32} className="text-signal-red" />,
      title: "Zero Agbero Interference",
      desc: "We strictly vet our operators and shield your assets from unauthorized individuals and street politics.",
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 bg-void-light border-y border-cobalt/30">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {features.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: idx * 0.2, duration: 0.6 }}
            className="flex flex-col gap-4 p-6 bg-void-navy rounded-xl border border-cobalt/50 hover:border-cobalt transition-colors"
          >
            <div className="p-4 bg-void-light rounded-lg w-fit">
              {feat.icon}
            </div>
            <h3 className="text-xl font-semibold text-crisp-white">{feat.title}</h3>
            <p className="text-slate-light leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 4. PROBLEM & SOLUTION TEXT
// ==========================================
function ProblemSolutionSection() {
  return (
    <section className="py-32 px-6 md:px-12 lg:px-24">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-crisp-white">
          The Transportation Sector is Lucrative. <br className="hidden md:block" />
          <span className="text-signal-red">Managing it is Not.</span>
        </h2>
        <p className="text-lg text-slate-light leading-relaxed mb-6">
          Often, investors purchase tricycles or other vehicles and entrust them to operators without fully understanding the intricacies of the business. This lack of understanding leads to disappointing outcomes and business collapse.
        </p>
        <p className="text-lg text-slate-light leading-relaxed">
          With years of experience as transporters in prominent locations in Lagos State, we possess in-depth knowledge of the business. We bridge the gap between your capital and sustainable, stress-free daily operations.
        </p>
      </motion.div>
    </section>
  );
}

// ==========================================
// 5. VEHICLE PORTFOLIO (Parallax Setup)
// ==========================================
function VehiclePortfolioSection() {
  const vehicles = [
    { name: "Tricycles (Keke)", yield: "High Frequency", imgPlaceholder: "Place Keke Image Here" },
    { name: "Cars for Uber/Bolt", yield: "Premium Returns", imgPlaceholder: "Place Car Image Here" },
    { name: "Minibuses (Korope)", yield: "Mass Transit", imgPlaceholder: "Place Bus Image Here" },
  ];

  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 bg-void-light">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-crisp-white">Manageable <span className="text-slate-light">Asset Classes</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {vehicles.map((v, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-void-navy border border-cobalt/50 relative h-96 flex flex-col justify-end"
            >
              {/* IMAGE PLACEHOLDER - Replace with <Image /> tag later */}
              <div className="absolute inset-0 bg-cobalt/20 flex items-center justify-center text-slate-light/50 font-mono text-sm group-hover:bg-cobalt/30 transition-colors">
                [{v.imgPlaceholder}]
              </div>
              
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-void-navy via-void-navy/60 to-transparent z-10" />
              
              <div className="relative z-20 p-6">
                <p className="text-signal-red font-semibold text-sm mb-2">{v.yield}</p>
                <h3 className="text-2xl font-bold text-crisp-white">{v.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
