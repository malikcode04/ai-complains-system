// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IComplaintRegistry {
    enum ComplaintStatus { Pending, Verified, InProgress, Resolved, Rejected }
    enum UrgencyLevel { Low, Medium, High, Critical }

    struct Complaint {
        uint256 id;
        address reporter;
        string description;
        string location; // Lat,Lon string or Geohash
        uint256 fAssetStake; // Amount of FAssets staked
        ComplaintStatus status;
        UrgencyLevel urgency;
        string category; // e.g., "Water", "Road"
        uint256 timestamp;
        string proofMetadata; // IPFS hash or similar
    }

    event ComplaintCreated(uint256 indexed id, address indexed reporter, string category);
    event ComplaintStatusUpdated(uint256 indexed id, ComplaintStatus newStatus);
    event ComplaintVerified(uint256 indexed id, bool verified);

    function createComplaint(
        string memory _description,
        string memory _location,
        string memory _category,
        string memory _proofMetadata
    ) external payable;

    function updateStatus(uint256 _id, ComplaintStatus _status) external;
    function getComplaint(uint256 _id) external view returns (Complaint memory);
}
