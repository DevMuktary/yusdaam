import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-void-navy border-t border-cobalt/30 pt-16 pb-8 relative z-40">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Top Section: 4-Column Industry Standard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Tagline */}
          <div className="flex flex-col items-start">
            <Link href="/" className="text-2xl font-black tracking-wider text-crisp-white mb-4 hover:opacity-80 transition">
              YUSDAAM<span className="text-signal-red">.</span>
            </Link>
            <p className="text-slate-light text-sm font-medium leading-relaxed">
              Premium Vehicle Asset Management. Own the asset. We do the work. You get paid weekly.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-start">
            <h4 className="text-xs font-bold text-slate-light/60 uppercase tracking-widest mb-6">Company</h4>
            <div className="flex flex-col gap-3 text-sm font-semibold text-slate-light">
              <Link href="/about" className="hover:text-signal-red transition w-max">About Us</Link>
              <Link href="/services" className="hover:text-signal-red transition w-max">Management Services</Link>
              <Link href="/quotes" className="hover:text-signal-red transition w-max">Vehicle Quotes</Link>
              <Link href="/riders/apply" className="hover:text-signal-red transition w-max">Drive For Us</Link>
            </div>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col items-start">
            <h4 className="text-xs font-bold text-slate-light/60 uppercase tracking-widest mb-6">Contact Us</h4>
            <div className="flex flex-col gap-4 text-sm font-medium text-slate-light">
              <a href="tel:09065000860" className="flex items-center gap-3 hover:text-signal-red transition w-max">
                <span className="w-8 h-8 rounded-full bg-void-light border border-cobalt flex items-center justify-center text-signal-red">
                  <Phone size={14} />
                </span>
                09065000860
              </a>
              <a href="mailto:info@yusdaamautos.com" className="flex items-center gap-3 hover:text-signal-red transition w-max">
                <span className="w-8 h-8 rounded-full bg-void-light border border-cobalt flex items-center justify-center text-signal-red">
                  <Mail size={14} />
                </span>
                info@yusdaamautos.com
              </a>
            </div>
          </div>

          {/* Column 4: App Downloads (Unclickable Placeholders) */}
          <div className="flex flex-col items-start">
            <h4 className="text-xs font-bold text-slate-light/60 uppercase tracking-widest mb-6">Get The App</h4>
            <div className="flex flex-col gap-3 w-full max-w-[160px]">
              
              {/* Apple App Store Placeholder */}
              <div className="flex items-center gap-2 bg-void-light/50 border border-cobalt/50 px-3 py-2 rounded-lg opacity-60 cursor-not-allowed select-none">
                <svg viewBox="0 0 384 512" width="20" height="20" fill="currentColor" className="text-crisp-white">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] leading-none text-slate-light/80 mb-0.5">Download on the</span>
                  <span className="text-sm font-bold leading-none text-crisp-white">App Store</span>
                </div>
              </div>

              {/* Google Play Store Placeholder */}
              <div className="flex items-center gap-2 bg-void-light/50 border border-cobalt/50 px-3 py-2 rounded-lg opacity-60 cursor-not-allowed select-none">
                <svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor" className="text-crisp-white">
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

        {/* Middle Section: The SEC Disclaimer */}
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
