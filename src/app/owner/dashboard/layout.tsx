import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CarFront, Wallet, FileText, LogOut, Briefcase } from "lucide-react";
import LogoutButton from "./LogoutButton"; // We will create this client component next

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Server-Side Protection
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/owner/login");
  }

  return (
    <div className="min-h-screen bg-void-navy flex flex-col md:flex-row text-crisp-white font-sans">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-void-navy border-r border-cobalt/20 h-screen sticky top-0">
        <div className="p-6 border-b border-cobalt/20">
          <Link href="/" className="text-2xl font-black tracking-wider text-crisp-white">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-light uppercase tracking-widest font-bold">
            <Briefcase size={12} className="text-cobalt" /> Asset Owner
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/owner/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-signal-red/10 text-signal-red font-bold transition-all border border-signal-red/20">
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </Link>
          <Link href="/owner/dashboard/assets" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-light hover:bg-void-light/5 hover:text-crisp-white transition-all">
            <CarFront size={18} />
            <span>My Fleet</span>
          </Link>
          <Link href="/owner/dashboard/ledger" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-light hover:bg-void-light/5 hover:text-crisp-white transition-all">
            <Wallet size={18} />
            <span>Financials</span>
          </Link>
          <Link href="/owner/dashboard/documents" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-light hover:bg-void-light/5 hover:text-crisp-white transition-all">
            <FileText size={18} />
            <span>Vault & Legal</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-cobalt/20">
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* MOBILE HEADER */}
        <header className="md:hidden flex items-center justify-between p-4 bg-void-navy border-b border-cobalt/20">
          <Link href="/" className="text-xl font-black tracking-wider text-crisp-white">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <LogoutButton mobile />
        </header>

        {/* PAGE CONTENT INJECTED HERE */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
