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
    { name: "Legal Vault", href: "/rider/dashboard/legal", icon: ShieldCheck },
    { name: "Support", href: "/rider/dashboard/support", icon: Wrench },
  ];

  return (
    // Explicit solid background for the main wrapper to prevent ANY transparency bleed
    <div className="min-h-screen bg-[#001232] flex flex-col md:flex-row text-white font-sans">
      
      {/* MOBILE HEADER - Solid Background */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#000A1F] sticky top-0 z-30 shadow-md">
        <Link href="/rider/dashboard" className="text-xl font-black tracking-wider text-white">
          YUSDAAM<span className="text-[#E94560]">.</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white transition">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE OVERLAY - Fixed to cover the entire screen behind the sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION - Solid #000A1F Background */}
      <aside className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#000A1F] border-r border-white/10 
        transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none
      `}>
        <div className="p-6 hidden md:block">
          <Link href="/rider/dashboard" className="text-2xl font-black tracking-wider text-white">
            YUSDAAM<span className="text-[#E94560]">.</span>
          </Link>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Rider Operations</p>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-5 border-b border-t md:border-t-0 border-white/10 bg-white/[0.02] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E94560]/20 border border-[#E94560] flex items-center justify-center text-[#E94560] shrink-0">
            <UserIcon size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-white">{status === "loading" ? "Loading..." : session?.user?.name || "Rider"}</p>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">Session Active</p>
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
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-sm font-bold uppercase tracking-wider ${
                  isActive 
                    ? "bg-[#E94560] text-white shadow-lg shadow-[#E94560]/20" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-gray-500"} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => signOut({ callbackUrl: "/rider/login" })}
            className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-[#E94560] hover:bg-[#E94560]/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
             Logout
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
