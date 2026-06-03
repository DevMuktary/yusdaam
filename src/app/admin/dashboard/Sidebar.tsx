"use client";

import { useState } from "react";
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
  Settings
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
      {/* MOBILE TOP BAR - Extreme Z-index to prevent any invisible overlap */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-void-navy border-b border-white/10 z-[9999] flex items-center justify-between px-4 shadow-md">
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MAIN SIDEBAR - Extreme Z-index so no charts/tables can block clicks */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-void-navy border-r border-white/10 flex flex-col z-[9999] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 hidden lg:block">
          <Link href="/" className="text-2xl font-black tracking-wider text-crisp-white hover:opacity-80 transition inline-block active:scale-95">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <p className="text-xs text-signal-red font-bold uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 lg:mt-2 overflow-y-auto pb-20 custom-scrollbar">
          {navItems.map((item) => {
            // SAFE PATHNAME CHECK: Prevents client crash during Next.js hydration
            const isActive = pathname 
              ? (pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"))) 
              : false;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                // CSS TACTILE FEEDBACK: active:scale-[0.97] makes it feel like a real physical button
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-75 active:scale-[0.97] active:opacity-75 ${
                  isActive 
                    ? "bg-cobalt/20 text-cobalt border border-cobalt/30 shadow-[0_0_15px_rgba(77,148,255,0.1)]" 
                    : "text-slate-light hover:bg-white/5 hover:text-crisp-white"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-cobalt" : "text-slate-light"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-void-navy">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-75 active:scale-[0.97] active:opacity-75"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
