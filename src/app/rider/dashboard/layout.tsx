"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession, SessionProvider } from "next-auth/react";
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

function RiderDashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Command Center", href: "/rider/dashboard", icon: LayoutDashboard },
    { name: "Remittances", href: "/rider/dashboard/remittances", icon: WalletCards },
    { name: "My Vehicle", href: "/rider/dashboard/vehicle", icon: CarFront },
    { name: "My Profile", href: "/rider/dashboard/profile", icon: UserIcon }, // <-- Added Profile here
    { name: "Legal Vault", href: "/rider/dashboard/legal", icon: ShieldCheck },
    { name: "Support", href: "/rider/dashboard/support", icon: Wrench },
  ];

  return (
    // Explicit solid background for the main wrapper to prevent ANY transparency bleed
    <div className="min-h-screen bg-[#001232] flex flex-col md:flex-row text-white font-sans">
      
      {/* MOBILE HEADER - Solid Background with Direct Logout */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#000A1F] sticky top-0 z-30 shadow-md">
        <Link href="/rider/dashboard" className="text-xl font-black tracking-wider text-white">
          YUSDAAM<span className="text-[#E94560]">.</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => signOut({ callbackUrl: "/rider/login" })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E94560]/15 hover:bg-[#E94560] text-[#E94560] hover:text-white border border-[#E94560]/30 rounded-lg text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-sm"
            title="Logout"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white transition p-1.5 rounded-lg bg-white/5 border border-white/10">
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY - Fixed to cover the entire screen behind the sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION - Dynamic 100dvh viewport height */}
      <aside className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 
        fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-64 bg-[#000A1F] border-r border-white/10 
        transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-2xl md:shadow-none
      `}>
        <div className="flex flex-col min-h-0 flex-1">
          <div className="p-6 hidden md:block">
            <Link href="/rider/dashboard" className="text-2xl font-black tracking-wider text-white">
              YUSDAAM<span className="text-[#E94560]">.</span>
            </Link>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Rider Operations</p>
          </div>

          {/* User Profile Summary */}
          <div className="px-5 py-4 border-b border-t md:border-t-0 border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#E94560]/20 border border-[#E94560] flex items-center justify-center text-[#E94560] shrink-0">
                <UserIcon size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-white">{status === "loading" ? "Loading..." : session?.user?.name || "Rider"}</p>
                <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">Active</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/rider/login" })}
              className="md:hidden text-gray-400 hover:text-[#E94560] p-1.5 transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                    isActive 
                      ? "bg-[#E94560] text-white shadow-lg shadow-[#E94560]/20" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-white" : "text-gray-500"} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ELEVATED LOGOUT FOOTER WITH SAFE PADDING */}
        <div className="p-3.5 pb-8 md:pb-4 border-t border-white/10 bg-[#000A1F] shrink-0">
          <button 
            onClick={() => signOut({ callbackUrl: "/rider/login" })}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-signal-red/10 hover:bg-signal-red border border-signal-red/30 hover:border-signal-red rounded-xl transition-all shadow-sm active:scale-98"
          >
            <LogOut size={16} />
            <span>End Session / Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative w-full h-full md:h-screen md:overflow-y-auto bg-[#001232]">
        <div className="p-4 sm:p-8 lg:p-12">
          {children}
        </div>
      </main>

    </div>
  );
}

export default function RiderDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RiderDashboardContent>{children}</RiderDashboardContent>
    </SessionProvider>
  );
}
