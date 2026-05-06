"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CarFront, Wallet, FileText, UserCog, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Fleet Portfolio", href: "/owner/dashboard/assets", icon: CarFront },
    { name: "Financial Ledger", href: "/owner/dashboard/ledger", icon: Wallet },
    { name: "Legal Vault", href: "/owner/dashboard/vault", icon: FileText },
    { name: "Profile Settings", href: "/owner/dashboard/profile", icon: UserCog },
  ];

  return (
    <aside className="w-64 bg-void-navy border-r border-cobalt/30 h-screen flex flex-col hidden lg:flex fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-cobalt/30">
        <h1 className="text-2xl font-black tracking-widest text-crisp-white">
          YUSDAAM<span className="text-signal-red">.</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
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

      {/* Footer / Logout */}
      <div className="p-4 border-t border-cobalt/30">
        <button 
          onClick={() => signOut({ callbackUrl: '/owner/login' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-void-light/5 hover:bg-signal-red/10 text-slate-light hover:text-signal-red border border-cobalt/20 hover:border-signal-red/30 rounded-xl transition font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={16} />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
