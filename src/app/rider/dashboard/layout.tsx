"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  WalletCards, 
  CarFront, 
  ShieldCheck, 
  Wrench, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon
} from "lucide-react";

export default function RiderDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Command Center", href: "/rider/dashboard", icon: LayoutDashboard },
    { name: "Remittances", href: "/rider/dashboard/remittances", icon: WalletCards },
    { name: "My Vehicle", href: "/rider/dashboard/vehicle", icon: CarFront },
    { name: "Legal Vault", href: "/rider/dashboard/documents", icon: ShieldCheck },
    { name: "Support & Incidents", href: "/rider/dashboard/support", icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-void-navy flex flex-col md:flex-row text-crisp-white font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-cobalt/20 bg-void-dark">
        <Link href="/rider/dashboard" className="text-xl font-black tracking-wider">
          YUSDAAM<span className="text-signal-red">.</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-light hover:text-crisp-white">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-void-dark border-r border-cobalt/20 
        transition-transform duration-300 ease-in-out flex flex-col
      `}>
        <div className="p-6 hidden md:block">
          <Link href="/rider/dashboard" className="text-2xl font-black tracking-wider">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mt-1">Rider Operations</p>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-4 border-b border-t md:border-t-0 border-cobalt/20 bg-void-light/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-signal-red/20 border border-signal-red flex items-center justify-center text-signal-red shrink-0">
            <UserIcon size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{status === "loading" ? "Loading..." : session?.user?.name || "Rider"}</p>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Session Active</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-bold uppercase tracking-wider ${
                  isActive 
                    ? "bg-signal-red text-crisp-white shadow-[0_0_15px_rgba(233,69,96,0.3)]" 
                    : "text-slate-light hover:bg-void-light/10 hover:text-crisp-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-crisp-white" : "text-cobalt"} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-cobalt/20">
          <button 
            onClick={() => signOut({ callbackUrl: "/rider/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-light hover:text-signal-red hover:bg-signal-red/10 rounded-lg transition-all"
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative max-h-screen overflow-y-auto">
        {/* Overlay for mobile when menu is open */}
        {isMobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-void-navy/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className="p-4 sm:p-8 lg:p-12">
          {children}
        </div>
      </main>

    </div>
  );
}
