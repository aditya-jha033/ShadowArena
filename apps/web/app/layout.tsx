import type { Metadata } from "next";
import { Orbitron, Rajdhani, Space_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Futuristic display font — used for headings, brand, big labels
const orbitron = Orbitron({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Condensed, techy body font — sharp and readable in dark UIs
const rajdhani = Rajdhani({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Monospace for wallet addresses, ZK proof labels, code, stats
const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shadow Arena — ZK Card Gaming on Midnight Network",
  description: "The premium ZK gaming table built on Midnight Network. Cheat-proof by construction. Private by default.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${rajdhani.variable} ${spaceMono.variable} antialiased`}>
        <ErrorBoundary>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
