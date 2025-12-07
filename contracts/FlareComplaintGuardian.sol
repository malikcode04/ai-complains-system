// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FlareComplaintGuardian
 * @dev Final Version for Hackathon. Fully compatible with MetaMask and Flare C-Chain.
 */

interface IFtsoRegistry {
    function getCurrentPriceWithDecimals(string memory _symbol) external view returns (uint256 value, uint256 timestamp, uint256 decimals);
}

interface IFAsset {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract FlareComplaintGuardian {
    
    enum ComplaintStatus { Submitted, Verified, InProgress, Resolved, Rejected }
    enum UrgencyLevel { Low, Medium, High, Critical }

    struct Complaint {
        uint256 id;
        address reporter;
        string description;
        string locationCoordinates;
        address fAssetToken;        
        uint256 stakedAmount;       
        ComplaintStatus status;
        UrgencyLevel urgency;
        string category;            
        uint256 timestamp;
        string proofIpfsHash;       
    }

    uint256 public nextComplaintId;
    mapping(uint256 => Complaint) public complaints;
    mapping(address => uint256[]) public userComplaints;
    
    address public admin;
    address public ftsoRegistry;
    
    uint256 public minStakeUSD = 5 * 10**18; // $5.00

    event ComplaintFiled(uint256 indexed id, address indexed reporter, string category, uint256 stake);
    event ComplaintStatusChanged(uint256 indexed id, ComplaintStatus status);
    event StakeSlashed(uint256 indexed id, address indexed reporter, uint256 amount);
    event StakeReturned(uint256 indexed id, address indexed reporter, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized: MetaMask account is not Admin");
        _;
    }

    constructor(address _ftsoRegistry) {
        require(_ftsoRegistry != address(0), "Invalid FTSO Address");
        admin = msg.sender; // The MetaMask account deploying this becomes Admin
        ftsoRegistry = _ftsoRegistry;
    }

    // --- Hackathon Helper ---
    // ALLOWS ANYONE TO BECOME ADMIN FOR DEMO PURPOSES
    function claimDemoAdmin() external {
        admin = msg.sender;
    }

    // --- Core Functions ---

    function submitComplaint(
        string memory _description,
        string memory _location,
        string memory _category,
        UrgencyLevel _urgency,
        string memory _mapboxUrl,
        address _fAssetToken,
        uint256 _stakeAmount
    ) external payable { 
        
        // 1. Handle Staking (Native FLR or ERC20)
        if (_fAssetToken == address(0)) {
            // Check if Native FLR sent with transaction matches stake amount
            require(msg.value >= _stakeAmount, "MetaMask: Insufficient FLR sent. Check 'Amount' field.");
        } else {
            // ERC20 FAsset Stake
            require(IFAsset(_fAssetToken).transferFrom(msg.sender, address(this), _stakeAmount), "MetaMask: FAsset transfer failed. Approve first?");
        }

        uint256 id = nextComplaintId++;
        
        complaints[id] = Complaint({
            id: id,
            reporter: msg.sender,
            description: _description,
            locationCoordinates: _location,
            fAssetToken: _fAssetToken,
            stakedAmount: _stakeAmount,
            status: ComplaintStatus.Submitted,
            urgency: _urgency,
            category: _category,
            timestamp: block.timestamp,
            proofIpfsHash: _mapboxUrl
        });

        userComplaints[msg.sender].push(id);
        emit ComplaintFiled(id, msg.sender, _category, _stakeAmount);
    }

    // --- Admin Actions ---

    function updateStatus(uint256 _id, ComplaintStatus _newStatus) external onlyAdmin {
        complaints[_id].status = _newStatus;
        emit ComplaintStatusChanged(_id, _newStatus);

        if (_newStatus == ComplaintStatus.Resolved) {
            _returnStake(_id);
        }
    }

    function rejectAndSlash(uint256 _id) external onlyAdmin {
        require(complaints[_id].status != ComplaintStatus.Resolved, "Already resolved");
        
        complaints[_id].status = ComplaintStatus.Rejected;
        uint256 amount = complaints[_id].stakedAmount;
        complaints[_id].stakedAmount = 0; 

        emit StakeSlashed(_id, complaints[_id].reporter, amount);
        
        // Slash goes to Admin (The MetaMask account)
        if (complaints[_id].fAssetToken == address(0)) {
            payable(admin).transfer(amount);
        } else {
             IFAsset(complaints[_id].fAssetToken).transfer(admin, amount);
        }
    }

    // --- Safety & Withdraw ---

    // Recover funds sent by mistake or leftover dust
    function withdrawFunds() external onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }

    // Allow contract to receive FLR directly
    receive() external payable {}

    // --- Internal & View ---

    function _returnStake(uint256 _id) internal {
        uint256 amount = complaints[_id].stakedAmount;
        address reporter = complaints[_id].reporter;
        address token = complaints[_id].fAssetToken;
        
        if (amount > 0) {
            complaints[_id].stakedAmount = 0;
            
            if (token == address(0)) {
                payable(reporter).transfer(amount);
            } else {
                IFAsset(token).transfer(reporter, amount);
            }
            emit StakeReturned(_id, reporter, amount);
        }
    }

    function verifyStakeValue(uint256 _complaintId, string memory _fAssetSymbol) external view returns (bool) {
        Complaint memory c = complaints[_complaintId];
        (uint256 price, , uint256 decimals) = IFtsoRegistry(ftsoRegistry).getCurrentPriceWithDecimals(_fAssetSymbol);
        uint256 valueUSD = (c.stakedAmount * price) / (10**decimals);
        return valueUSD >= minStakeUSD;
    }
    
    function getComplaint(uint256 _id) external view returns (Complaint memory) {
        return complaints[_id];
    }
}
