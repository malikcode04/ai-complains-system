"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/WalletProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MapPin, Sparkles, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { FLARE_CONTRACT_ABI, FLARE_CONTRACT_ADDRESS } from '@/lib/contracts';

export default function SubmitPage() {
    const { address, smartAccountAddress, isConnecting } = useWallet();
    const [description, setDescription] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [aiData, setAiData] = useState<any>(null);
    const [location, setLocation] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleAnalyze = async () => {
        if (!description) return;
        setAnalyzing(true);
        try {
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
            const data = await res.json();
            if (data.success) {
                setAiData(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            setLocation("Mock: 40.7128,-74.0060");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`),
            () => setLocation("Mock: 51.5074,-0.1278")
        );
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Urgency Map
            const urgencyMap: any = { 'Low': 0, 'Medium': 1, 'High': 2, 'Critical': 3 };
            const urgencyVal = urgencyMap[aiData?.urgency] || 1;

            // 1. Submit to Blockchain (if connected)
            // Note: This relies on browser wallet (MetaMask) injection
            if ((window as any).ethereum) {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(FLARE_CONTRACT_ADDRESS, FLARE_CONTRACT_ABI, signer);

                // Stake 0.1 FLR (Native)
                const stakeAmount = ethers.parseEther("0.1");

                console.log("Submitting to chain...", {
                    desc: description,
                    loc: location || "Unknown",
                    cat: aiData?.category || "Uncategorized",
                    urg: urgencyVal,
                    proof: "ipfs://mock",
                    token: ethers.ZeroAddress,
                    stake: stakeAmount
                });

                const tx = await contract.submitComplaint(
                    description,
                    location || "Unknown",
                    aiData?.category || "Uncategorized",
                    urgencyVal,
                    "ipfs://mock",
                    ethers.ZeroAddress, // Native FLR
                    stakeAmount,
                    { value: stakeAmount }
                );

                await tx.wait();
                console.log("Chain tx success:", tx.hash);
            }

            // 2. Call API to store (Backup/Indexing)
            await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    location: location || "Unknown Location",
                    category: aiData?.category || "Uncategorized",
                    urgency: aiData?.urgency || "Medium",
                    reporter: address,
                    fAssetStake: 0.1,
                    proofMetadata: "ipfs://mock",
                    status: "Submitted" // Chain status
                })
            });

            router.push('/dashboard');
        } catch (e: any) {
            console.error("Submission error:", e);
            alert("Error submitting: " + (e.reason || e.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (!address && !isConnecting) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Wallet Disconnected</h2>
                <p className="text-slate-400">Please connect your Wallet to file a complaint.</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-400">
                        New Complaint
                    </h1>
                    <p className="text-slate-400">Powered by AI Analysis & FAsset Security.</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Describe the Issue
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleAnalyze}
                            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-pink-500/50 outline-none transition"
                            placeholder="E.g., Large pothole on 5th Avenue causing traffic backup..."
                        />
                        <div className="mt-2 flex justify-end">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleAnalyze}
                                disabled={analyzing || !description}
                                className="text-pink-400 hover:text-pink-300 hover:bg-pink-950/30"
                            >
                                {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                Run AI Analysis
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {aiData && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl flex gap-4 items-start"
                            >
                                <AlertTriangle className={`w-5 h-5 mt-1 ${aiData.urgency === 'Critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                                <div>
                                    <h4 className="font-semibold text-indigo-200">AI Assessment</h4>
                                    <p className="text-sm text-slate-400 mt-1">{aiData.summary}</p>
                                    <div className="flex gap-2 mt-3">
                                        <Badge color="blue">{aiData.category}</Badge>
                                        <Badge color={aiData.urgency === 'Critical' ? 'red' : 'yellow'}>
                                            Urgency: {aiData.urgency}
                                        </Badge>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-slate-300">
                                Location Verification (FTSO)
                            </label>
                            <Button variant="outline" size="sm" onClick={getUserLocation} className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" /> Get Verified Location
                            </Button>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-slate-400">
                            {location || "Location not verified yet."}
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || !description || !location}
                        className="w-full h-12 text-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-xl shadow-purple-900/20"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit On-Chain Complaint"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

function Badge({ children, color }: { children: React.ReactNode, color: string }) {
    const colors: any = {
        blue: "bg-blue-950 text-blue-300 border-blue-800",
        red: "bg-red-950 text-red-300 border-red-800",
        yellow: "bg-yellow-950 text-yellow-300 border-yellow-800",
    }
    return (
        <span className={`px-2 py-1 rounded border text-xs font-medium ${colors[color] || colors.blue}`}>
            {children}
        </span>
    )
}
