// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockFTSO {
    function getCurrentPriceWithDecimals(string memory _symbol) external view returns (uint256, uint256, uint256) {
        // Return arbitrary price: 1.50 USD (decimals 5 for example)
        // Value: 150000 
        return (150000, block.timestamp, 5); 
    }
    
    function getCurrentPrice(string memory _symbol) external view returns (uint256, uint256) {
        return (150000, block.timestamp);
    }
}
