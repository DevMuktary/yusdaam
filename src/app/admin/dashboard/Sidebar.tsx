"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  ShieldCheck, 
  Banknote, 
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users & KYC", href: "/admin/dashboard/users", icon: Users },
    { name: "Vehicles", href: "/admin/dashboard/vehicles", icon: Car },
    { name: "Guarantors", href: "/admin/dashboard/guarantors", icon: ShieldCheck },
    { name: "Ledger", href: "/admin/dashboard/ledger", icon: Banknote },
  ];

  return (
    <>
      {/* MOBILE TOP BAR (Hidden on Desktop) */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-void-navy border-b border-white/10 z-40 flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-black tracking-wider text-crisp-white">
          YUSDAAM<span className="text-signal-red">.</span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-light hover:text-white transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MAIN SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-void-navy border-r border-white/10 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 hidden lg:block">
          <Link href="/" className="text-2xl font-black tracking-wider text-crisp-white hover:opacity-80 transition inline-block">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <p className="text-xs text-signal-red font-bold uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 lg:mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)} // Close sidebar on mobile after clicking
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive 
                    ? "bg-cobalt/20 text-cobalt border border-cobalt/30" 
                    : "text-slate-light hover:bg-white/5 hover:text-crisp-white"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
