import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const inter = Inter({ subsets: ["latin"] });

// SEC COMPLIANCE: Changed "Investment Management" to "Asset Management"
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
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <main className="flex-grow">
          {children}
        </main>
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
