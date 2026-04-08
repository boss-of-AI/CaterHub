import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

// 1. IMPORT THE NOTIFICATION TOOLS
import { Toaster } from "react-hot-toast";
import NotificationListener from "@/components/NotificationListener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CaterMe | Mumbai's Premium Catering Marketplace",
  description: "Book top-rated caterers for weddings and corporate events in Mumbai.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* 2. PLACE THE NOTIFICATION COMPONENTS INSIDE THE AUTH PROVIDER */}
          <Toaster />
          <NotificationListener />

          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}