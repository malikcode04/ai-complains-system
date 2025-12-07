export const FLARE_CONTRACT_ABI = [
    "function nextComplaintId() view returns (uint256)",
    "function complaints(uint256) view returns (uint256 id, address reporter, string description, string locationCoordinates, address fAssetToken, uint256 stakedAmount, uint8 status, uint8 urgency, string category, uint256 timestamp, string proofIpfsHash)",
    "function userComplaints(address) view returns (uint256[])",
    "function submitComplaint(string, string, string, uint8, string, address, uint256) payable",
    "function updateStatus(uint256, uint8) external",
    "function rejectAndSlash(uint256) external"
];

// Placeholder - User needs to update this after Remix deployment
export const FLARE_CONTRACT_ADDRESS = "0x661Eb227623690F53B2B605D1AdeFb8764733910"; 
