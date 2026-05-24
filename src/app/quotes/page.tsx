"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Info, ShieldAlert, ShieldCheck, Banknote, CarFront, Clock, FileText, Menu, X } from "lucide-react";

const quotesData = [
  {
    asset: "Tricycle (Keke)",
    cost: "₦4.5M - ₦5M",
    expenses: "—",
    weekly: "₦80,000",
    period: "95 - 100 Weeks",
    total: "₦7.5M - ₦8M",
  },
  {
    asset: "Mini-Bus (Korope)",
    cost: "₦4.5M - ₦5M",
    expenses: "₦500,000",
    weekly: "₦80,000",
    period: "95 - 100 Weeks",
    total: "₦8M - ₦8.5M",
  },
  {
    asset: "Long-Bus (14 Passengers)",
    cost: "₦6.5M - ₦7.5M",
    expenses: "₦1M",
    weekly: "₦100,000",
    period: "115 - 120 Weeks",
    total: "₦12.5M - ₦13.5M",
  },
  {
    asset: "Car For Uber",
    cost: "₦10M - ₦11M",
    expenses: "—",
    weekly: "₦100,000",
    period: "150 - 160 Weeks",
    total: "₦15M - ₦16M",
  },
  {
    asset: "Long-Bus (Coaster Bus)",
    cost: "₦13M - ₦15M",
    expenses: "₦1M",
    weekly: "₦100,000",
    period: "170 - 175 Weeks",
    total: "₦17M - ₦18M",
  },
  {
    asset: "Tipper-Truck",
    cost: "₦90M - ₦95M",
    expenses: "—",
    weekly: "₦1.2M",
    period: "150 - 160 Weeks",
    total: "₦180M - ₦190M",
  },
];

export default function QuotesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="bg-void-navy min-h-screen text-slate-light selection:bg-cobalt selection:text-white overflow-x-hidden w-full max-w-[100vw]">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[60] px-4 sm:px-6 py-4 border-b border-cobalt/20 bg-void-navy/90 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          
          <Link href="/" className="z-[70] block hover:opacity-80 transition">
            <Image 
              src="/images/logo2.PNG" 
              alt="Yusdaam Autos Logo" 
              width={400} 
              height={120} 
              className="object-contain h-8 sm:h-10 w-auto scale-[2.5] sm:scale-[3.2] origin-left" 
              priority
            />
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden lg:flex gap-8 text-sm font-semibold text-slate-light tracking-wide uppercase items-center">
            <Link href="/" className="hover:text-crisp-white hover:text-signal-red transition">Home</Link>
            <Link href="/about" className="hover:text-crisp-white hover:text-signal-red transition">About Us</Link>
            <Link href="/services" className="hover:text-crisp-white hover:text-signal-red transition">Services</Link>
            <Link href="/quotes" className="text-signal-red transition">Vehicle Quotes</Link>
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
          <Link href="/quotes" onClick={() => setIsMobileMenuOpen(false)} className="text-signal-red">Vehicle Quotes</Link>
          
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
      <div className="pt-24 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
          
          {/* Header */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-cobalt hover:text-white transition uppercase tracking-widest mb-8">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            
            <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-crisp-white tracking-tight uppercase mb-3">
                  Vehicle Purchase <span className="text-signal-red">Quote</span>
                </h1>
                <p className="text-lg text-emerald-400 font-medium">We Quote, Client Pays Dealer.</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3 w-fit">
                <Info size={20} className="text-cobalt shrink-0" />
                <p className="text-xs font-medium">Indicative dealer costs as of <span className="text-white font-bold">May 30, 2026</span></p>
              </div>
            </div>
          </div>

          {/* The Quotes Table */}
          <div className="bg-void-light/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-black/20 text-xs uppercase tracking-widest text-gray-400 border-b border-white/10">
                    <th className="p-5 font-bold">Asset Class</th>
                    <th className="p-5 font-bold">Purchase Cost</th>
                    <th className="p-5 font-bold">Other Expenses <span className="lowercase text-[10px] normal-case opacity-70 block">(Conversion, etc.)</span></th>
                    <th className="p-5 font-bold text-emerald-400">Target Weekly<br/>Remittance</th>
                    <th className="p-5 font-bold">Remittance Period</th>
                    <th className="p-5 font-bold text-right text-emerald-400">Total Projected<br/>Remittance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quotesData.map((quote, index) => (
                    <tr key={index} className="hover:bg-white/5 transition duration-150 group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-cobalt transition">
                            <CarFront size={18} className="text-cobalt" />
                          </div>
                          <span className="font-bold text-sm text-white uppercase tracking-wider">{quote.asset}</span>
                        </div>
                      </td>
                      <td className="p-5 font-mono text-sm">{quote.cost}</td>
                      <td className="p-5 font-mono text-sm text-gray-400">{quote.expenses}</td>
                      <td className="p-5 font-mono text-sm font-bold text-emerald-400">{quote.weekly}</td>
                      <td className="p-5 text-sm flex items-center gap-2 mt-2">
                        <Clock size={14} className="text-gray-500" /> {quote.period}
                      </td>
                      <td className="p-5 font-mono text-base font-black text-emerald-400 text-right">
                        {quote.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-black/20 p-4 border-t border-white/10 text-xs text-gray-400 text-center">
              * YUSDAAM AUTOS does not sell vehicles. Final cost confirmed in supplier invoice. 
            </div>
          </div>

          {/* Calculation Logic Note */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <FileText size={18} className="text-emerald-400" /> Remittance Calculation Logic
            </h4>
            <p className="text-sm text-gray-400 mb-3">The estimated weekly remittance period and projected total remittance amount are calculated based on:</p>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300 font-medium">
              <li>The actual purchase price of the vehicle acquired by the Owner.</li>
              <li>The total hire purchase value at which the vehicle is assigned to the Rider/Driver.</li>
              <li>The agreed weekly remittance amount payable by the Rider/Driver.</li>
            </ol>
          </div>

          {/* Legal Clauses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            
            <div className="bg-void-navy border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Clock size={64} /></div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Validity Period
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                This Purchase Facilitation is valid for <strong>7 calendar days</strong> from May 30, 2026. Dealer prices may change after this date due to FX and customs fluctuations.
              </p>
            </div>

            <div className="bg-void-navy border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Banknote size={64} /></div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-signal-red"></span> Price Variation Clause
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                Total Indicative Purchase Cost is based on current dealer rates. If the supplier increases the price before the owner pays the dealer directly, YUSDAAM will issue a revised quote for the owner's approval. The owner may decline and source independently. <strong>YUSDAAM earns ₦0 from the vehicle purchase.</strong>
              </p>
            </div>

            <div className="bg-void-navy border border-cobalt/30 p-6 rounded-xl shadow-lg relative overflow-hidden md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={64} className="text-cobalt" /></div>
              <h3 className="text-sm font-bold text-cobalt uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cobalt"></span> Role Clarity Clause
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                YUSDAAM AUTOS acts solely as a Hire Purchase Administrator under Power of Attorney. <strong>We do not receive, hold, or invest owner funds.</strong> The owner pays the vehicle dealer/supplier directly upon approval of this quote.
              </p>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl shadow-lg relative overflow-hidden md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldAlert size={64} className="text-red-500" /></div>
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Official Disclaimer
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                YUSDAAM AUTOS is a Hire Purchase Administrator. We do not sell vehicles or collect owner capital. Purchase costs are market-dependent. Remittance figures are targets based on current driver data and are not guaranteed. <strong>Our administration fee is ₦0 from vehicle owners.</strong>
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
