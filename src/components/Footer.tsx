import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-void-navy border-t border-cobalt/30 pt-12 pb-8 relative z-40">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        
        {/* 1. THE SEC DISCLAIMER (Moved to the very top) */}
        <div className="bg-void-light/40 border border-cobalt/50 p-5 sm:p-6 rounded-2xl mb-12 shadow-lg">
          <h4 className="text-[11px] sm:text-xs font-bold text-signal-red uppercase tracking-widest mb-3 text-center sm:text-left">
            Legal & Regulatory Disclaimer
          </h4>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-light/75 leading-relaxed text-justify sm:text-left">
            YUSDAAM AUTOS INVESTMENT MANAGEMENT NIG LTD RC-9335611 is a vehicle asset management company registered with CAC. We provide vehicle procurement and management services to individual asset owners. We do not operate a collective investment scheme, solicit public deposits, or offer securities. We are not licensed by the Securities and Exchange Commission as Fund/Portfolio Managers. All vehicles are purchased and owned directly by clients with full legal title. Remittance figures are based on historical operational data and are not guaranteed returns.
          </p>
        </div>

        {/* 2. MAIN FOOTER CONTENT */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-12">
          
          {/* Brand & Tagline - Centered on mobile, left on desktop */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:w-1/3">
            <Link href="/" className="text-3xl font-black tracking-wider text-crisp-white mb-4 hover:opacity-80 transition">
              YUSDAAM<span className="text-signal-red">.</span>
            </Link>
            <p className="text-slate-light text-sm sm:text-base font-medium leading-relaxed max-w-sm">
              Premium Vehicle Asset Management. Own the asset. We do the work. You get paid weekly.
            </p>
          </div>

          {/* Links & Contact - Placed in a 2-column grid on mobile to save vertical space! */}
          <div className="grid grid-cols-2 gap-4 sm:gap-12 lg:w-1/3 w-full">
            
            {/* Company Links */}
            <div className="flex flex-col items-center sm:items-start">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-light/60 uppercase tracking-widest mb-5">Company</h4>
              <div className="flex flex-col gap-3 text-xs sm:text-sm font-semibold text-slate-light items-center sm:items-start">
                <Link href="/about" className="hover:text-signal-red transition">About Us</Link>
                <Link href="/services" className="hover:text-signal-red transition text-center sm:text-left">Management Services</Link>
                <Link href="/quotes" className="hover:text-signal-red transition text-center sm:text-left">Vehicle Quotes</Link>
                <Link href="/riders/apply" className="hover:text-signal-red transition">Drive For Us</Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col items-center sm:items-start">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-light/60 uppercase tracking-widest mb-5">Contact Us</h4>
              <div className="flex flex-col gap-4 text-xs sm:text-sm font-medium text-slate-light items-center sm:items-start w-full">
                <a href="tel:09065000860" className="flex flex-col sm:flex-row items-center sm:items-start gap-2 hover:text-signal-red transition">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-void-light border border-cobalt flex items-center justify-center text-signal-red mb-1 sm:mb-0">
                    <Phone size={14} />
                  </span>
                  <span className="mt-1">09065000860</span>
                </a>
                <a href="mailto:info@yusdaamautos.com" className="flex flex-col sm:flex-row items-center sm:items-start gap-2 hover:text-signal-red transition">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-void-light border border-cobalt flex items-center justify-center text-signal-red mb-1 sm:mb-0">
                    <Mail size={14} />
                  </span>
                  <span className="mt-1 break-all text-center sm:text-left">info@yusdaamautos.com</span>
                </a>
              </div>
            </div>

          </div>

          {/* App Downloads - Horizontal row on mobile, Vertical on desktop */}
          <div className="flex flex-col items-center lg:items-start lg:w-1/4 mt-4 lg:mt-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-light/60 uppercase tracking-widest mb-5">Get The App</h4>
            
            <div className="flex flex-row lg:flex-col gap-3 justify-center w-full max-w-[320px] lg:max-w-none">
              
              {/* Apple App Store */}
              <div className="flex flex-1 items-center justify-center lg:justify-start gap-2 bg-void-light/50 border border-cobalt/50 px-3 py-2.5 rounded-xl opacity-60 cursor-not-allowed select-none min-w-[130px]">
                <svg viewBox="0 0 384 512" width="22" height="22" fill="currentColor" className="text-crisp-white">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] leading-none text-slate-light/80 mb-0.5">Download on the</span>
                  <span className="text-sm font-bold leading-none text-crisp-white">App Store</span>
                </div>
              </div>

              {/* Google Play */}
              <div className="flex flex-1 items-center justify-center lg:justify-start gap-2 bg-void-light/50 border border-cobalt/50 px-3 py-2.5 rounded-xl opacity-60 cursor-not-allowed select-none min-w-[130px]">
                <svg viewBox="0 0 512 512" width="22" height="22" fill="currentColor" className="text-crisp-white">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] leading-none text-slate-light/80 mb-0.5">GET IT ON</span>
                  <span className="text-sm font-bold leading-none text-crisp-white">Google Play</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 3. BOTTOM FOOTER (Copyright & Legal Links) */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-cobalt/30 pt-6 gap-4">
          <div className="text-xs sm:text-sm font-medium text-slate-light/60 text-center md:text-left">
            &copy; 2026 YUSDAAM AUTOS. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-slate-light/60">
            <Link href="/legal/agreement" className="hover:text-crisp-white hover:text-signal-red transition text-center">
              Vehicle Asset Management Agreement
            </Link>
            <span className="text-cobalt hidden sm:inline">|</span>
            <Link href="/legal/privacy" className="hover:text-crisp-white hover:text-signal-red transition text-center">
              Privacy Policy
            </Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
