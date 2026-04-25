import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Using Inter for clean, financial-grade typography
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YUSDAAM Autos | Lagos Transport Investment Management",
  description: "Invest in tricycles, cars, and minibuses with zero risk. We manage the fleet, you get guaranteed weekly returns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Navigation bar will go here later */}
        <main className="flex-grow">
          {children}
        </main>
        {/* Footer will go here later */}
      </body>
    </html>
  );
}
