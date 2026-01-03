// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {AirdropToken} from "../src/AirdropToken.sol";
import {AirdropEngine} from "../src/AirdropEngine.sol";

contract DeployScript is Script {
    function run() external {
        // Get deployer from the private key passed via --private-key flag
        // Foundry automatically handles the private key when using --private-key flag
        address deployer = msg.sender;
        
        console2.log("Deploying contracts...");
        console2.log("Deployer address:", deployer);
        console2.log("Deployer balance:", deployer.balance / 1e18, "RBTC");
        
        // Start broadcast - Foundry will use the private key from --private-key flag
        vm.startBroadcast();
        
        // Deploy AirdropToken
        string memory baseURI = "https://api.example.com/token/{id}.json";
        AirdropToken token = new AirdropToken(baseURI, deployer);
        console2.log("AirdropToken deployed at:", address(token));
        
        // Deploy AirdropEngine
        AirdropEngine engine = new AirdropEngine(deployer);
        console2.log("AirdropEngine deployed at:", address(engine));
        
        // Create an example campaign (optional - for demonstration)
        // Note: You'll need to provide a valid merkle root
        // This is commented out as it requires off-chain merkle tree generation
        
        /*
        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        
        bytes32 merkleRoot = bytes32(0x0); // Replace with actual merkle root
        string memory metadata = '{"name": "Example Campaign", "description": "Test campaign"}';
        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + 30 days;
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            merkleRoot,
            metadata,
            startTime,
            endTime
        );
        
        console2.log("Example campaign created with ID:", campaignId);
        */
        
        vm.stopBroadcast();
        
        console2.log("\n=== Deployment Summary ===");
        console2.log("AirdropToken:", address(token));
        console2.log("AirdropEngine:", address(engine));
        console2.log("\nNext steps:");
        console2.log("1. Mint tokens to AirdropEngine for distribution");
        console2.log("2. Generate merkle tree off-chain for eligible addresses");
        console2.log("3. Create campaign using createCampaign() function");
        console2.log("4. Users can claim using claim() with merkle proof");
    }
}

