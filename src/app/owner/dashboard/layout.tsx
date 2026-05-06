import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-void-dark flex">
      {/* Permanent Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        
        {/* Mobile Header & Sliding Navigation (Hidden on Desktop) */}
        <MobileNav />

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
