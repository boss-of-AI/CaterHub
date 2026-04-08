import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. IMPORT THE NOTIFICATION TOOLS
import { Toaster } from "react-hot-toast";
import NotificationListener from "@/components/NotificationListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CaterMe Partner Portal",
  description: "Manage your catering business in Mumbai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 2. ADD THE TOASTER AND LISTENER HERE */}
        <Toaster />
        <NotificationListener />

        {children}
      </body>
    </html>
  );
}