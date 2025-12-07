"use client";
import Link from 'next/link';
import { useWallet } from './WalletProvider';
import { Button } from './ui/button'; // We'll just use standard HTML button or basic styles if UI lib not fully setup
import { Shield, ExternalLink, Menu } from 'lucide-react';

export default function Navbar() {
    const { address, smartAccountAddress, connect, disconnect, isConnecting } = useWallet();

    return (
        <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-pink-500" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                                FLARE-AI Guardian
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                Dashboard
                            </Link>
                            <Link href="/submit" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                File Complaint
                            </Link>
                            <Link href="/admin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                Admin
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {address ? (
                            <div className="flex flex-col items-end">
                                <button onClick={disconnect} className="text-sm text-red-400 hover:text-red-300 transition">
                                    Disconnect
                                </button>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Smart: {smartAccountAddress?.slice(0, 6)}...{smartAccountAddress?.slice(-4)}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={connect}
                                disabled={isConnecting}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/20"
                            >
                                {isConnecting ? "Connecting..." : "Connect Wallet"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
