import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingWhatsApp from "@/components/FloatingWhatsApp"; // Added import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YUSDAAM Autos | Lagos Transport Investment Management",
  description: "Own the asset. We do the work. You get paid weekly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        
        <main className="flex-grow">
          {children}
        </main>
        
        {/* The global WhatsApp button */}
        <FloatingWhatsApp />
        
      </body>
    </html>
  );
}
