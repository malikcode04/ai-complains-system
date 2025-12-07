import { ethers } from 'ethers';
import { FLARE_CONTRACT_ABI, FLARE_CONTRACT_ADDRESS } from './contracts';

// Coston2 RPC
const RPC_URL = "https://coston2-api.flare.network/ext/C/rpc";

export interface ChainComplaint {
    id: number;
    reporter: string;
    description: string;
    locationCoordinates: string;
    fAssetToken: string;
    stakedAmount: string;
    status: string;
    urgency: string;
    category: string;
    timestamp: number;
    proofIpfsHash: string;
}

export async function fetchAllComplaintsFromChain(): Promise<ChainComplaint[]> {


    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(FLARE_CONTRACT_ADDRESS, FLARE_CONTRACT_ABI, provider);

        const countBN = await contract.nextComplaintId();
        const count = Number(countBN);

        const complaints: ChainComplaint[] = [];
        const statusMap = ["Submitted", "Verified", "InProgress", "Resolved", "Rejected"];
        const urgencyMap = ["Low", "Medium", "High", "Critical"];

        // Reverse loop to get newest first, limit to last 20 for performance in demo
        const limit = Math.max(0, count - 20);

        for (let i = count - 1; i >= limit; i--) {
            const c = await contract.complaints(i);
            complaints.push({
                id: Number(c.id),
                reporter: c.reporter,
                description: c.description,
                locationCoordinates: c.locationCoordinates,
                fAssetToken: c.fAssetToken,
                stakedAmount: ethers.formatEther(c.stakedAmount),
                status: statusMap[Number(c.status)] || "Unknown",
                urgency: urgencyMap[Number(c.urgency)] || "Unknown",
                category: c.category,
                timestamp: Number(c.timestamp) * 1000,
                proofIpfsHash: c.proofIpfsHash
            });
        }

        return complaints;
    } catch (error) {
        console.error("Error fetching from chain:", error);
        return [];
    }
}
