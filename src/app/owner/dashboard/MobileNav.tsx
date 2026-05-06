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
      {/* Mobile Sticky Header */}
      <header className="lg:hidden h-16 bg-void-navy border-b border-cobalt/30 flex items-center justify-between px-6 sticky top-0 z-30">
        <h1 className="text-xl font-black tracking-widest text-crisp-white">
          YUSDAAM<span className="text-signal-red">.</span>
        </h1>
        <button onClick={() => setIsOpen(true)} className="text-crisp-white hover:text-signal-red transition">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Slide-Out Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Menu Panel */}
          <div className="relative w-64 max-w-[80vw] bg-void-navy h-full flex flex-col border-r border-cobalt/30 animate-in slide-in-from-left-8 duration-300 shadow-2xl">
            <div className="h-20 flex items-center justify-between px-6 border-b border-cobalt/30">
              <h1 className="text-xl font-black tracking-widest text-crisp-white">
                YUSDAAM<span className="text-signal-red">.</span>
              </h1>
              <button onClick={() => setIsOpen(false)} className="text-slate-light hover:text-signal-red transition">
                <X size={24} />
              </button>
            </div>
            
            {/* Links */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm tracking-wider uppercase ${
                      isActive 
                        ? "bg-signal-red/10 text-signal-red border border-signal-red/20" 
                        : "text-slate-light hover:text-crisp-white hover:bg-void-light/5 border border-transparent"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-signal-red" : "text-cobalt"} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Footer */}
            <div className="p-4 border-t border-cobalt/30">
              <button 
                onClick={() => signOut({ callbackUrl: '/owner/login' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-void-light/5 hover:bg-signal-red/10 text-slate-light hover:text-signal-red border border-cobalt/20 hover:border-signal-red/30 rounded-xl transition font-bold text-xs uppercase tracking-widest"
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
