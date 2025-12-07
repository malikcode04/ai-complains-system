import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy MockFTSO
    const MockFTSO = await ethers.getContractFactory("MockFTSO");
    const mockFtso = await MockFTSO.deploy();
    await mockFtso.waitForDeployment();
    const mockFtsoAddress = await mockFtso.getAddress();
    console.log("MockFTSO deployed to:", mockFtsoAddress);

    // 2. Deploy ComplaintRegistry
    const ComplaintRegistry = await ethers.getContractFactory("ComplaintRegistry");
    const complaintRegistry = await ComplaintRegistry.deploy(mockFtsoAddress);
    await complaintRegistry.waitForDeployment();
    console.log("ComplaintRegistry deployed to:", await complaintRegistry.getAddress());

    // 3. Deploy SmartAccountManager
    const SmartAccountManager = await ethers.getContractFactory("SmartAccountManager");
    const smartAccountManager = await SmartAccountManager.deploy();
    await smartAccountManager.waitForDeployment();
    console.log("SmartAccountManager deployed to:", await smartAccountManager.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
