"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer"; // Adjust this import based on your actual Footer location

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide the footer on all dashboard and login routes
  const isDashboardOrAuth = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/owner/dashboard") || 
    pathname.startsWith("/rider/dashboard") ||
    pathname.includes("/login") ||
    pathname.includes("/register");

  if (isDashboardOrAuth) {
    return null;
  }

  return <Footer />;
}
