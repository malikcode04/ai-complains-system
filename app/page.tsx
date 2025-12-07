"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';
import { useWallet } from '@/components/WalletProvider';
import { motion } from 'framer-motion';

export default function Home() {
  const { address, connect, isConnecting } = useWallet();

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950 z-10"></div>
        <img src="/hero.png" alt="Hero" className="w-full h-full object-cover opacity-30" />
      </div>

      <div className="z-10 max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">Live on Flare Network</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-500 drop-shadow-sm">
            The Future of <br /> Civic Integrity
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Report implementation gaps, road hazards, and utility failures securely.
            Backed by <span className="text-pink-400 font-semibold">FAssets</span> and verified by <span className="text-blue-400 font-semibold">FTSO</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {address ? (
              <Link href="/submit">
                <Button size="lg" className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25">
                  File a Complaint <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-slate-950 hover:bg-slate-200"
                onClick={connect}
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
              </Button>
            )}
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-slate-700 bg-black/40 backdrop-blur-md hover:bg-slate-800">
                View Live Feed
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left"
        >
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 text-green-400" />}
            title="Verified Proofs"
            desc="Every complaint is anchored on-chain with FAsset stakes to prevent spam."
          />
          <FeatureCard
            icon={<Activity className="h-8 w-8 text-blue-400" />}
            title="Real-time FTSO"
            desc="Location and timestamp data is validated against the Flare Time Series Oracle."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-purple-400" />}
            title="AI & Gasless"
            desc="Smart Accounts enable gasless reporting ensuring zero friction for citizens."
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition duration-300">
      <div className="mb-4 p-2 bg-slate-800/50 rounded-lg inline-block">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
