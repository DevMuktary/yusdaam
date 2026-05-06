import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav"; // We will build a mobile-friendly header next if needed

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-void-dark flex">
      {/* Permanent Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="lg:hidden h-16 bg-void-navy border-b border-cobalt/30 flex items-center justify-between px-6 sticky top-0 z-30">
           <h1 className="text-xl font-black tracking-widest text-crisp-white">
            YUSDAAM<span className="text-signal-red">.</span>
          </h1>
          {/* Mobile hamburger menu trigger can go here later */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
