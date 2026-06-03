"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Banknote, 
  CreditCard,
  LogOut,
  Menu,
  X,
  FileCheck,
  MessageSquare,
  ClipboardList,
  Settings,
  Loader2 // <-- Added Loader for instant click feedback
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // NEW: State to track which link is currently loading the next page
  const [loadingHref, setLoadingHref] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Clear the loading spinner the moment the page successfully changes
  useEffect(() => {
    setLoadingHref(null);
  }, [pathname]);

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "RIDERS KYC", href: "/admin/dashboard/kyc/riders", icon: FileCheck },
    { name: "OWNERS KYC", href: "/admin/dashboard/kyc/owners", icon: FileCheck },
    { name: "Vehicles", href: "/admin/dashboard/vehicles", icon: Car },
    { name: "Ledger", href: "/admin/dashboard/ledger", icon: Banknote },
    { name: "PAYMENTS", href: "/admin/dashboard/payments", icon: CreditCard },
    { name: "MESSAGE", href: "/admin/dashboard/messages", icon: MessageSquare },
    { name: "USERS", href: "/admin/dashboard/users", icon: Users },
    { name: "ASSIGNMENT", href: "/admin/dashboard/assignment", icon: ClipboardList },
    { name: "SETTINGS", href: "/admin/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* MOBILE TOP BAR (Bumped z-index to 90) */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-void-navy border-b border-white/10 z-[90] flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-black tracking-wider text-crisp-white">
          YUSDAAM<span className="text-signal-red">.</span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-light hover:text-white transition active:scale-90"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MAIN SIDEBAR (Bumped z-index to 100 to make it unblockable) */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-void-navy border-r border-white/10 flex flex-col z-[100] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 hidden lg:block">
          <Link href="/" className="text-2xl font-black tracking-wider text-crisp-white hover:opacity-80 transition inline-block">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <p className="text-xs text-signal-red font-bold uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 lg:mt-2 overflow-y-auto pb-6 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const isCurrentlyLoading = loadingHref === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Only show loader if we are actually navigating to a new page
                  if (pathname !== item.href) {
                    setLoadingHref(item.href);
                  }
                  setIsOpen(false);
                }}
                // Added `active:scale-[0.98]` for a tactile click feel
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all active:scale-[0.98] ${
                  isActive 
                    ? "bg-cobalt/20 text-cobalt border border-cobalt/30" 
                    : "text-slate-light hover:bg-white/5 hover:text-crisp-white"
                } ${isCurrentlyLoading ? "opacity-70 pointer-events-none" : ""}`}
              >
                {isCurrentlyLoading ? (
                  <Loader2 size={20} className="animate-spin text-cobalt" />
                ) : (
                  <item.icon size={20} />
                )}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              setIsSigningOut(true);
              signOut({ callbackUrl: "/admin/login" });
            }}
            disabled={isSigningOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSigningOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
