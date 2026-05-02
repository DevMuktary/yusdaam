"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <button onClick={() => signOut({ callbackUrl: "/owner/login" })} className="text-slate-light hover:text-signal-red transition">
        <LogOut size={20} />
      </button>
    );
  }

  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/owner/login" })}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-light hover:bg-signal-red/10 hover:text-signal-red transition-all font-bold text-sm uppercase tracking-wider"
    >
      <LogOut size={18} />
      <span>Secure Logout</span>
    </button>
  );
}
