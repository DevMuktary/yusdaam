"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  ShieldCheck, 
  Banknote, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users & KYC", href: "/admin/dashboard/users", icon: Users },
    { name: "Vehicles", href: "/admin/dashboard/vehicles", icon: Car },
    { name: "Guarantors", href: "/admin/dashboard/guarantors", icon: ShieldCheck },
    { name: "Ledger", href: "/admin/dashboard/ledger", icon: Banknote },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-void-navy border-r border-white/10 hidden lg:flex flex-col z-50">
      <div className="p-6">
        <Link href="/" className="text-2xl font-black tracking-wider text-crisp-white hover:opacity-80 transition inline-block">
          YUSDAAM<span className="text-signal-red">.</span>
        </Link>
        <p className="text-xs text-signal-red font-bold uppercase tracking-widest mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
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
  );
}
