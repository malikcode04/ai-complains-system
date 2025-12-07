// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IComplaintRegistry.sol";

// Mock Interfaces for FTSO/FAssets
interface IFTSO {
    function getCurrentPrice(string memory _symbol) external view returns (uint256, uint256);
}

contract ComplaintRegistry is IComplaintRegistry {
    uint256 public nextId;
    mapping(uint256 => Complaint) public complaints;
    address public admin;
    
    // FTSO Mock Address
    address public ftsoAddress;
    
    // Simple staking requirement (in Wei/Token units)
    uint256 public constant MIN_STAKE = 0.01 ether; 

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor(address _ftsoAddress) {
        admin = msg.sender;
        ftsoAddress = _ftsoAddress;
    }

    function createComplaint(
        string memory _description,
        string memory _location,
        string memory _category,
        string memory _proofMetadata
    ) external payable override {
        // Require some stake (Native FLR or mocked FAsset)
        require(msg.value >= MIN_STAKE, "Insufficient stake");

        complaints[nextId] = Complaint({
            id: nextId,
            reporter: msg.sender,
            description: _description,
            location: _location,
            fAssetStake: msg.value,
            status: ComplaintStatus.Pending,
            urgency: UrgencyLevel.Medium, // Default, updated by AI/Admin
            category: _category,
            timestamp: block.timestamp,
            proofMetadata: _proofMetadata
        });

        emit ComplaintCreated(nextId, msg.sender, _category);
        nextId++;
    }

    function updateStatus(uint256 _id, ComplaintStatus _status) external override onlyAdmin {
        require(_id < nextId, "Complaint does not exist");
        complaints[_id].status = _status;
        
        // If resolved, return stake + reward (mock logic)
        if (_status == ComplaintStatus.Resolved) {
             uint256 stake = complaints[_id].fAssetStake;
             if (stake > 0) {
                 complaints[_id].fAssetStake = 0;
                 payable(complaints[_id].reporter).transfer(stake);
             }
        }
        
        emit ComplaintStatusUpdated(_id, _status);
    }

    // Example of FTSO usage: Get price of an asset to verify value (Mock scenario)
    function verifyWithFTSO(string memory _asset) external view returns (uint256) {
        (uint256 price, ) = IFTSO(ftsoAddress).getCurrentPrice(_asset);
        return price;
    }

    function getComplaint(uint256 _id) external view override returns (Complaint memory) {
         require(_id < nextId, "Complaint does not exist");
         return complaints[_id];
    }
}
