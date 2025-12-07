import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Changing font to be more modern
import "./globals.css";
import Navbar from "@/components/Navbar";
import { WalletProvider } from "@/components/WalletProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "FLARE-AI Complaint Guardian",
  description: "AI-Powered Complaint Portal on Flare Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col`}
      >
        <WalletProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t border-slate-900 py-8 text-center text-slate-500 text-sm">
            Powered by Flare Network & AI Agents
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
