"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CarFront, Wallet, FileText, UserCog, LogOut, Menu, X } from "lucide-react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Fleet Portfolio", href: "/owner/dashboard/assets", icon: CarFront },
    { name: "Financial Ledger", href: "/owner/dashboard/ledger", icon: Wallet },
    { name: "Legal Vault", href: "/owner/dashboard/vault", icon: FileText },
    { name: "Profile Settings", href: "/owner/dashboard/profile", icon: UserCog },
  ];

  return (
    <>
      {/* Mobile Sticky Header with Quick Logout */}
      <header className="lg:hidden h-16 bg-void-navy border-b border-cobalt/30 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-md">
        <Link href="/owner/dashboard" className="text-xl font-black tracking-widest text-crisp-white">
          YUSDAAM<span className="text-signal-red">.</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => signOut({ callbackUrl: "/owner/login" })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-signal-red/15 hover:bg-signal-red text-signal-red hover:text-white border border-signal-red/30 rounded-lg text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-sm"
            title="Logout"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
          <button onClick={() => setIsOpen(true)} className="text-crisp-white hover:text-signal-red transition p-1.5 rounded-lg bg-white/5 border border-white/10">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Menu Panel - Dynamic 100dvh viewport height */}
          <div className="relative w-64 max-w-[80vw] bg-void-navy h-[100dvh] flex flex-col justify-between border-r border-cobalt/30 animate-in slide-in-from-left-8 duration-300 shadow-2xl">
            <div className="flex flex-col min-h-0 flex-1">
              <div className="h-16 flex items-center justify-between px-6 border-b border-cobalt/30 shrink-0">
                <h1 className="text-xl font-black tracking-widest text-crisp-white">
                  YUSDAAM<span className="text-signal-red">.</span>
                </h1>
                <button onClick={() => setIsOpen(false)} className="text-slate-light hover:text-signal-red transition p-1">
                  <X size={22} />
                </button>
              </div>
              
              {/* Links */}
              <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition font-bold text-xs tracking-wider uppercase ${
                        isActive 
                          ? "bg-signal-red/15 text-signal-red border border-signal-red/30 shadow-lg shadow-signal-red/10" 
                          : "text-slate-light hover:text-crisp-white hover:bg-void-light/5 border border-transparent"
                      }`}
                    >
                      <Icon size={16} className={isActive ? "text-signal-red" : "text-cobalt"} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Elevated Logout Footer with Safe Padding */}
            <div className="p-3.5 pb-8 border-t border-cobalt/30 shrink-0 bg-void-navy">
              <button 
                onClick={() => signOut({ callbackUrl: '/owner/login' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-signal-red/15 hover:bg-signal-red text-signal-red hover:text-white border border-signal-red/30 rounded-xl transition font-bold text-xs uppercase tracking-widest shadow-sm active:scale-98"
              >
                <LogOut size={16} />
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
