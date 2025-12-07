"use client";
import { useEffect, useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { Loader2, CheckCircle, Clock, Link as LinkIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Dashboard() {
    const { address } = useWallet();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        setLoading(true);
        fetch(`/api/complaints`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setComplaints(data.data);
                }
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">My Dashboard</h1>
                    <p className="text-slate-400 text-sm">Viewing data from: <span className="text-blue-400 font-bold uppercase">ON-CHAIN</span></p>
                </div>

                <div className="flex gap-2">
                    <Link href="/submit">
                        <Button>New Complaint</Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : complaints.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                    No complaints found on the Blockchain.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {complaints.map((c: any) => (
                        <div key={c.id !== undefined ? c.id : c._id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-4 backdrop-blur-sm hover:bg-slate-900/60 transition group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <Shield className="w-24 h-24" />
                            </div>

                            <div className="z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${c.urgency === 'Critical' ? 'bg-red-900/50 text-red-400' :
                                        c.urgency === 'High' ? 'bg-orange-900/50 text-orange-400' : 'bg-blue-900/50 text-blue-400'
                                        }`}>
                                        {c.urgency} Priority
                                    </span>
                                    <span className="text-slate-500 text-xs font-mono">
                                        {new Date(c.createdAt || c.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">{c.description}</h3>
                                <div className="text-sm text-slate-400 flex flex-wrap items-center gap-2 mt-2">
                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">{c.category}</span>
                                    <span className="flex items-center gap-1 text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                        <LinkIcon className="w-3 h-3" /> {c.locationCoordinates || c.location}
                                    </span>
                                    {c.stakedAmount && (
                                        <span className="text-xs text-pink-400 font-mono">
                                            Stake: {c.stakedAmount}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l border-slate-800 pl-4 z-10 min-w-[100px] justify-end">
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 uppercase">Status</div>
                                    <div className={`font-bold ${c.status === 'Resolved' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {c.status}
                                    </div>
                                </div>
                                {c.status === 'Resolved' && <CheckCircle className="text-green-500" />}
                                {c.status !== 'Resolved' && <Clock className="text-yellow-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
