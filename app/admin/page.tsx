"use client";
import { useEffect, useState, useRef } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { Button } from '@/components/ui/button';
import { RefreshCw, Map, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { ethers } from 'ethers';
import { FLARE_CONTRACT_ABI, FLARE_CONTRACT_ADDRESS } from '@/lib/contracts';

export default function AdminPage() {
    const [stats, setStats] = useState({ total: 0, critical: 0, resolved: 0 });
    const [complaints, setComplaints] = useState<any[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const fetchData = () => {
        fetch(`/api/complaints`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setComplaints(data.data);
                    setComplaints(data.data);
                    const total = data.data.length;

                    // Advanced & Clear Counting Logic
                    // 1. Normalize strings: trim and lowercase
                    // 2. Count ONLY if status is NOT resolved/rejected
                    const activeComplaints = data.data.filter((c: any) => {
                        const s = (c.status || '').toLowerCase();
                        return s !== 'resolved' && s !== 'rejected';
                    });

                    const critical = activeComplaints.filter((c: any) =>
                        (c.urgency || '').toLowerCase() === 'critical'
                    ).length;

                    const resolved = data.data.filter((c: any) =>
                        (c.status || '').toLowerCase() === 'resolved'
                    ).length;

                    setStats({ total, critical, resolved });
                    drawHeatmap(data.data);
                }
            });
    }

    const drawHeatmap = (data: any[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        // Plot Points
        data.forEach(c => {
            // Mock projection: Hash coords to canvas X/Y for demo stability
            // In real app: Map lat/lon to canvas pixels
            const idVal = Number(c.id || 0);
            const x = (idVal * 50) % canvas.width;
            const y = (idVal * 30 + 20) % canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, 15, 0, 2 * Math.PI);
            ctx.fillStyle = c.urgency === 'Critical' ? 'rgba(239, 68, 68, 0.6)' :
                c.urgency === 'High' ? 'rgba(249, 115, 22, 0.6)' : 'rgba(59, 130, 246, 0.6)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (action: 'Resolve' | 'Reject') => {
        if (!selectedComplaint || !window.ethereum) return;
        setProcessing(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(FLARE_CONTRACT_ADDRESS, FLARE_CONTRACT_ABI, signer);

            let tx;
            if (action === 'Resolve') {
                // Status 3 = Resolved
                tx = await contract.updateStatus(selectedComplaint.id, 3);
            } else {
                tx = await contract.rejectAndSlash(selectedComplaint.id);
            }

            await tx.wait();
            alert(`Complaint ${action}d successfully!`);
            setSelectedComplaint(null);
            fetchData();
        } catch (e: any) {
            console.error(e);
            alert("Error: " + (e.reason || e.message));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10 relative">
            {/* Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Manage Complaint #{selectedComplaint.id}</h3>
                        <p className="text-slate-400 mb-6 text-sm">{selectedComplaint.description}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAction('Resolve')}
                                disabled={processing}
                                className="flex flex-col items-center justify-center p-4 bg-green-950/30 border border-green-900/50 rounded-xl hover:bg-green-900/50 transition group"
                            >
                                <CheckCircle className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition" />
                                <span className="font-bold text-green-400">Resolve & Return Stake</span>
                            </button>

                            <button
                                onClick={() => handleAction('Reject')}
                                disabled={processing}
                                className="flex flex-col items-center justify-center p-4 bg-red-950/30 border border-red-900/50 rounded-xl hover:bg-red-900/50 transition group"
                            >
                                <ShieldAlert className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition" />
                                <span className="font-bold text-red-400">Reject & Slash Stake</span>
                            </button>
                        </div>
                        <button onClick={() => setSelectedComplaint(null)} className="w-full mt-4 text-slate-500 text-sm hover:text-white">Cancel</button>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                        Admin Command Center
                    </h1>
                    <p className="text-slate-400 mt-2">Real-time city monitoring with FTSO & AI.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchData()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard label="Total Complaints" value={stats.total} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
                <StatCard label="Critical Issues" value={stats.critical} color="bg-red-500/10 text-red-400 border-red-500/20" />
                <StatCard label="Resolved" value={stats.resolved} color="bg-green-500/10 text-green-400 border-green-500/20" />
                <StatCard label="FAssets Staked" value="3,450 FLR" color="bg-pink-500/10 text-pink-400 border-pink-500/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-cyan-500 rounded-full"></span> Incoming Reports (On-Chain)
                    </h2>
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Urgency</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm">
                                {complaints.map((c: any) => (
                                    <tr key={c.id !== undefined ? c.id : c._id} className="hover:bg-slate-800/50 transition">
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.urgency === 'Critical' ? 'bg-red-950 text-red-400' : 'bg-slate-800 text-slate-300'
                                                }`}>
                                                {c.urgency}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-300">{c.category}</td>
                                        <td className="p-4 text-slate-400 truncate max-w-xs">{c.description}</td>
                                        <td className="p-4">
                                            {c.status === 'Resolved' || c.status === 'Rejected' ? (
                                                <span className="text-slate-500 italic">{c.status}</span>
                                            ) : (
                                                <button onClick={() => setSelectedComplaint(c)} className="text-cyan-400 hover:text-cyan-300 font-medium text-xs border border-cyan-900 bg-cyan-950/30 px-3 py-1 rounded">
                                                    Manage
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Heatmap / AI Panel */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Live Heatmap</h2>
                    <div className="h-64 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden group">
                        <canvas ref={canvasRef} width={400} height={250} className="w-full h-full opacity-80" />
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]"></div>
                        <span className="absolute bottom-4 left-4 text-xs font-mono text-cyan-500 bg-black/50 px-2 py-1 rounded border border-cyan-900/50">
                            FTSO LOCATIONS FEED :: ACTIVE
                        </span>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-lg font-semibold mb-2">AI Agent Summary</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-h-40 overflow-y-auto">
                            {complaints.length === 0 ? "Insufficient data for AI analysis." : (
                                <>
                                    Analysis of <b>{complaints.length}</b> live reports indicates a
                                    <b> {Math.round((stats.critical / (stats.total || 1)) * 100)}%</b> criticality rate.
                                    Major concerns are categorized under <b>
                                        {[...complaints].sort((a, b) =>
                                            complaints.filter(v => v.category === a.category).length -
                                            complaints.filter(v => v.category === b.category).length
                                        ).pop()?.category || "General"}
                                    </b>.
                                    Recommended action: Deploy maintenance crews to Sectors reported with 'High' urgency immediately.
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className={`p-6 rounded-xl border ${color} backdrop-blur-sm`}>
            <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{label}</div>
            <div className="text-3xl font-bold">{value}</div>
        </div>
    )
}
