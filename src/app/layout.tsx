import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ConditionalFooter from "@/components/ConditionalFooter";

const inter = Inter({ subsets: ["latin"] });

// SEC COMPLIANCE: "Asset Management" instead of "Investment Management"
export const metadata: Metadata = {
  title: "YUSDAAM Autos | Lagos Transport Asset Management",
  description: "Own the asset. We do the work. You get paid weekly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-void-navy text-slate-light`}>
        
        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* Conditional Footer (Hidden on dashboards/login) */}
        <ConditionalFooter />

        {/* Global WhatsApp Button (Floats above everything) */}
        <FloatingWhatsApp />
        
      </body>
    </html>
  );
}
