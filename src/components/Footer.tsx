import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-void-navy border-t border-cobalt/30 pt-16 pb-8 relative z-40">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Top Section: Brand & Quick Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="text-2xl font-black tracking-wider text-crisp-white mb-3 hover:opacity-80 transition">
              YUSDAAM<span className="text-signal-red">.</span>
            </Link>
            <p className="text-slate-light text-sm max-w-xs text-center md:text-left font-medium">
              Premium Vehicle Asset Management. Own the asset. We do the work. You get paid weekly.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-light uppercase tracking-widest">
            <Link href="/about" className="hover:text-signal-red transition">About</Link>
            <Link href="/services" className="hover:text-signal-red transition">Services</Link>
            <Link href="/quotes" className="hover:text-signal-red transition">Quotes</Link>
            <Link href="/riders/apply" className="hover:text-signal-red transition">Drive For Us</Link>
          </div>
        </div>

        {/* Middle Section: The SEC Disclaimer (Styled as an official legal box) */}
        <div className="bg-void-light/30 border border-cobalt/40 p-5 sm:p-6 rounded-xl mb-8 shadow-inner">
          <h4 className="text-[10px] sm:text-xs font-bold text-signal-red uppercase tracking-widest mb-3">
            Legal & Regulatory Disclaimer
          </h4>
          <p className="text-xs sm:text-sm text-slate-light/75 leading-relaxed text-justify sm:text-left">
            YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD RC-9335611 is a vehicle asset management company registered with CAC. We provide vehicle procurement and management services to individual asset owners. We do not operate a collective investment scheme, solicit public deposits, or offer securities. We are not licensed by the Securities and Exchange Commission as Fund/Portfolio Managers. All vehicles are purchased and owned directly by clients with full legal title. Remittance figures are based on historical operational data and are not guaranteed returns.
          </p>
        </div>

        {/* Bottom Section: Copyright & Legal Links */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-cobalt/30 pt-6 gap-4">
          <div className="text-xs sm:text-sm font-medium text-slate-light/60 text-center md:text-left">
            &copy; 2026 YUSDAAM AUTOS. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-light/60">
            <Link href="/legal/agreement" className="hover:text-crisp-white hover:text-signal-red transition">
              Vehicle Asset Management Agreement
            </Link>
            <span className="text-cobalt hidden sm:inline">|</span>
            <Link href="/legal/privacy" className="hover:text-crisp-white hover:text-signal-red transition">
              Privacy Policy
            </Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
