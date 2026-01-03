// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {AirdropEngine} from "../src/AirdropEngine.sol";
import {AirdropToken} from "../src/AirdropToken.sol";
import {MockRUNESToken} from "../src/mocks/MockRUNESToken.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract AirdropEngineTest is Test {
    AirdropEngine public engine;
    AirdropToken public token;
    MockRUNESToken public runesToken;

    address public admin = address(0x1);
    address public operator = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);
    address public user3 = address(0x5);

    uint256 public constant TOKEN_ID_1 = 1;
    uint256 public constant TOKEN_ID_2 = 2;
    uint256 public constant AMOUNT_1 = 100;
    uint256 public constant AMOUNT_2 = 200;

    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy contracts
        token = new AirdropToken("https://example.com/api/token/{id}.json", admin);
        runesToken = new MockRUNESToken("Mock RUNES", "MRUNES", 18, 1000000 ether);
        engine = new AirdropEngine(admin);
        
        // Grant operator role
        engine.grantRole(engine.OPERATOR_ROLE(), operator);
        
        vm.stopPrank();
    }

    // Helper function to create merkle tree leaves
    function createLeaf(
        uint256 campaignId,
        address account,
        uint256 tokenId,
        uint256 amount
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(campaignId, account, tokenId, amount));
    }

    // Test campaign creation
    function test_CreateCampaign_ERC1155() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = TOKEN_ID_1;
        tokenIds[1] = TOKEN_ID_2;
        
        bytes32 merkleRoot = bytes32(uint256(0x123));
        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + 30 days;
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            merkleRoot,
            '{"name": "Test Campaign"}',
            startTime,
            endTime
        );
        
        assertEq(campaignId, 0);
        
        AirdropEngine.Campaign memory campaign = engine.getCampaign(campaignId);
        
        assertEq(campaign.tokenContract, address(token));
        assertEq(campaign.isRunesToken, false);
        assertEq(campaign.merkleRoot, merkleRoot);
        assertTrue(campaign.active);
        
        vm.stopPrank();
    }

    function test_CreateCampaign_RUNES() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](0);
        bytes32 merkleRoot = bytes32(uint256(0x456));
        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + 30 days;
        
        uint256 campaignId = engine.createCampaign(
            address(runesToken),
            true,
            tokenIds,
            merkleRoot,
            '{"name": "RUNES Campaign"}',
            startTime,
            endTime
        );
        
        assertEq(campaignId, 0);
        
        AirdropEngine.Campaign memory campaign = engine.getCampaign(campaignId);
        
        assertEq(campaign.tokenContract, address(runesToken));
        assertTrue(campaign.isRunesToken);
        assertTrue(campaign.active);
        
        vm.stopPrank();
    }

    function test_CreateCampaign_RevertIf_InvalidTokenContract() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        vm.expectRevert("AirdropEngine: invalid token contract");
        engine.createCampaign(
            address(0),
            false,
            tokenIds,
            bytes32(uint256(0x123)),
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        vm.stopPrank();
    }

    function test_CreateCampaign_RevertIf_InvalidTimeRange() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        vm.expectRevert("AirdropEngine: invalid time range");
        engine.createCampaign(
            address(token),
            false,
            tokenIds,
            bytes32(uint256(0x123)),
            "",
            block.timestamp + 30 days,
            block.timestamp
        );
        
        vm.stopPrank();
    }

    // Test claim functionality
    function test_Claim_ERC1155_Success() public {
        vm.startPrank(admin);
        
        // Create campaign
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        bytes32[] memory leaves = new bytes32[](3);
        leaves[0] = createLeaf(0, user1, TOKEN_ID_1, AMOUNT_1);
        leaves[1] = createLeaf(0, user2, TOKEN_ID_1, AMOUNT_2);
        leaves[2] = createLeaf(0, user3, TOKEN_ID_1, 50);
        
        bytes32 merkleRoot = _buildMerkleRoot(leaves);
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            merkleRoot,
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        // Mint tokens to engine
        token.mint(address(engine), TOKEN_ID_1, 1000, "");
        
        vm.stopPrank();
        
        // Generate proof for user1
        bytes32[] memory proof = _getProof(leaves, 0);
        
        // User1 claims
        vm.prank(user1);
        engine.claim(campaignId, TOKEN_ID_1, AMOUNT_1, proof);
        
        // Verify user1 received tokens
        assertEq(token.balanceOf(user1, TOKEN_ID_1), AMOUNT_1);
        
        // Verify leaf is marked as claimed
        bytes32 leaf = createLeaf(campaignId, user1, TOKEN_ID_1, AMOUNT_1);
        assertTrue(engine.isClaimed(campaignId, leaf));
    }

    function test_Claim_RUNES_Success() public {
        vm.startPrank(admin);
        
        // Create RUNES campaign
        uint256[] memory tokenIds = new uint256[](0);
        
        bytes32[] memory leaves = new bytes32[](2);
        leaves[0] = createLeaf(0, user1, 0, 1000 ether);
        leaves[1] = createLeaf(0, user2, 0, 2000 ether);
        
        // Sort leaves for proper merkle tree (OpenZeppelin uses sorted pairs)
        if (leaves[0] > leaves[1]) {
            bytes32 temp = leaves[0];
            leaves[0] = leaves[1];
            leaves[1] = temp;
        }
        
        bytes32 merkleRoot = _buildMerkleRoot(leaves);
        
        uint256 campaignId = engine.createCampaign(
            address(runesToken),
            true,
            tokenIds,
            merkleRoot,
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        // Transfer RUNES tokens to engine
        runesToken.transfer(address(engine), 5000 ether);
        
        vm.stopPrank();
        
        // Find the correct index for user1's leaf after sorting
        bytes32 user1Leaf = createLeaf(0, user1, 0, 1000 ether);
        uint256 leafIndex = 0;
        if (leaves[0] != user1Leaf) {
            leafIndex = 1;
        }
        
        // Generate proof for user1
        bytes32[] memory proof = _getProof(leaves, leafIndex);
        
        uint256 balanceBefore = runesToken.balanceOf(user1);
        
        // User1 claims
        vm.prank(user1);
        engine.claim(campaignId, 0, 1000 ether, proof);
        
        // Verify user1 received tokens
        assertEq(runesToken.balanceOf(user1), balanceBefore + 1000 ether);
    }

    function test_Claim_RevertIf_InvalidProof() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        bytes32 merkleRoot = bytes32(uint256(0x123));
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            merkleRoot,
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        token.mint(address(engine), TOKEN_ID_1, 1000, "");
        
        vm.stopPrank();
        
        // Try to claim with invalid proof
        bytes32[] memory invalidProof = new bytes32[](1);
        invalidProof[0] = bytes32(uint256(0x999));
        
        vm.prank(user1);
        vm.expectRevert("AirdropEngine: invalid proof");
        engine.claim(campaignId, TOKEN_ID_1, AMOUNT_1, invalidProof);
    }

    function test_Claim_RevertIf_AlreadyClaimed() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        bytes32[] memory leaves = new bytes32[](1);
        leaves[0] = createLeaf(0, user1, TOKEN_ID_1, AMOUNT_1);
        
        bytes32 merkleRoot = _buildMerkleRoot(leaves);
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            merkleRoot,
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        token.mint(address(engine), TOKEN_ID_1, 1000, "");
        
        vm.stopPrank();
        
        bytes32[] memory proof = _getProof(leaves, 0);
        
        // First claim succeeds
        vm.prank(user1);
        engine.claim(campaignId, TOKEN_ID_1, AMOUNT_1, proof);
        
        // Second claim should fail
        vm.prank(user1);
        vm.expectRevert("AirdropEngine: already claimed");
        engine.claim(campaignId, TOKEN_ID_1, AMOUNT_1, proof);
    }

    function test_Claim_RevertIf_CampaignNotStarted() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        bytes32 merkleRoot = bytes32(uint256(0x123));
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            merkleRoot,
            "",
            block.timestamp + 1 days,
            block.timestamp + 30 days
        );
        
        vm.stopPrank();
        
        bytes32[] memory proof = new bytes32[](0);
        
        vm.prank(user1);
        vm.expectRevert("AirdropEngine: campaign not started");
        engine.claim(campaignId, TOKEN_ID_1, AMOUNT_1, proof);
    }

    function test_Claim_RevertIf_CampaignEnded() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        bytes32 merkleRoot = bytes32(uint256(0x123));
        
        // Set a specific timestamp to avoid underflow
        uint256 startTime = 1000;
        uint256 endTime = 2000;
        vm.warp(3000); // Move time forward so campaign is definitely ended
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            merkleRoot,
            "",
            startTime,
            endTime
        );
        
        vm.stopPrank();
        
        bytes32[] memory proof = new bytes32[](0);
        
        vm.prank(user1);
        vm.expectRevert("AirdropEngine: campaign ended");
        engine.claim(campaignId, TOKEN_ID_1, AMOUNT_1, proof);
    }

    function test_Claim_RevertIf_CampaignNotActive() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        bytes32 merkleRoot = bytes32(uint256(0x123));
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            merkleRoot,
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        // Deactivate campaign
        engine.setCampaignActive(campaignId, false);
        
        vm.stopPrank();
        
        bytes32[] memory proof = new bytes32[](0);
        
        vm.prank(user1);
        vm.expectRevert("AirdropEngine: campaign not active");
        engine.claim(campaignId, TOKEN_ID_1, AMOUNT_1, proof);
    }

    // Test batch airdrop
    function test_BatchAirdrop_ERC1155() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            bytes32(uint256(0x123)),
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        token.mint(address(engine), TOKEN_ID_1, 1000, "");
        
        vm.stopPrank();
        
        // Batch airdrop
        address[] memory recipients = new address[](2);
        recipients[0] = user1;
        recipients[1] = user2;
        
        uint256[] memory ids = new uint256[](2);
        ids[0] = TOKEN_ID_1;
        ids[1] = TOKEN_ID_1;
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = AMOUNT_1;
        amounts[1] = AMOUNT_2;
        
        vm.prank(operator);
        engine.batchAirdrop(campaignId, recipients, ids, amounts);
        
        assertEq(token.balanceOf(user1, TOKEN_ID_1), AMOUNT_1);
        assertEq(token.balanceOf(user2, TOKEN_ID_1), AMOUNT_2);
    }

    function test_BatchAirdrop_RUNES() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](0);
        
        uint256 campaignId = engine.createCampaign(
            address(runesToken),
            true,
            tokenIds,
            bytes32(uint256(0x123)),
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        runesToken.transfer(address(engine), 5000 ether);
        
        vm.stopPrank();
        
        address[] memory recipients = new address[](2);
        recipients[0] = user1;
        recipients[1] = user2;
        
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 0;
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1000 ether;
        amounts[1] = 2000 ether;
        
        vm.prank(operator);
        engine.batchAirdrop(campaignId, recipients, ids, amounts);
        
        assertEq(runesToken.balanceOf(user1), 1000 ether);
        assertEq(runesToken.balanceOf(user2), 2000 ether);
    }

    function test_BatchAirdrop_RevertIf_NotOperator() public {
        vm.startPrank(admin);
        
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = TOKEN_ID_1;
        
        uint256 campaignId = engine.createCampaign(
            address(token),
            false,
            tokenIds,
            bytes32(uint256(0x123)),
            "",
            block.timestamp,
            block.timestamp + 30 days
        );
        
        vm.stopPrank();
        
        address[] memory recipients = new address[](1);
        recipients[0] = user1;
        
        uint256[] memory ids = new uint256[](1);
        ids[0] = TOKEN_ID_1;
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = AMOUNT_1;
        
        vm.prank(user1);
        vm.expectRevert();
        engine.batchAirdrop(campaignId, recipients, ids, amounts);
    }

    // Helper functions for Merkle tree
    function _buildMerkleRoot(bytes32[] memory leaves) internal pure returns (bytes32) {
        if (leaves.length == 0) return bytes32(0);
        if (leaves.length == 1) return leaves[0];
        
        uint256 length = leaves.length;
        bytes32[] memory currentLevel = leaves;
        
        while (length > 1) {
            uint256 nextLevelLength = (length + 1) / 2;
            bytes32[] memory nextLevel = new bytes32[](nextLevelLength);
            
            for (uint256 i = 0; i < nextLevelLength; i++) {
                if (i * 2 + 1 < length) {
                    nextLevel[i] = keccak256(
                        abi.encodePacked(currentLevel[i * 2], currentLevel[i * 2 + 1])
                    );
                } else {
                    nextLevel[i] = currentLevel[i * 2];
                }
            }
            
            currentLevel = nextLevel;
            length = nextLevelLength;
        }
        
        return currentLevel[0];
    }

    function _getProof(bytes32[] memory leaves, uint256 index) internal pure returns (bytes32[] memory) {
        if (leaves.length <= 1) return new bytes32[](0);
        
        uint256 proofLength = 0;
        uint256 temp = leaves.length;
        while (temp > 1) {
            proofLength++;
            temp = (temp + 1) / 2;
        }
        
        bytes32[] memory proof = new bytes32[](proofLength);
        uint256 currentIndex = index;
        bytes32[] memory currentLevel = leaves;
        uint256 currentLength = leaves.length;
        uint256 proofIndex = 0;
        
        while (currentLength > 1) {
            if (currentIndex % 2 == 0) {
                if (currentIndex + 1 < currentLength) {
                    proof[proofIndex] = currentLevel[currentIndex + 1];
                }
            } else {
                proof[proofIndex] = currentLevel[currentIndex - 1];
            }
            
            uint256 nextLevelLength = (currentLength + 1) / 2;
            bytes32[] memory nextLevel = new bytes32[](nextLevelLength);
            
            for (uint256 i = 0; i < nextLevelLength; i++) {
                if (i * 2 + 1 < currentLength) {
                    nextLevel[i] = keccak256(
                        abi.encodePacked(currentLevel[i * 2], currentLevel[i * 2 + 1])
                    );
                } else {
                    nextLevel[i] = currentLevel[i * 2];
                }
            }
            
            currentLevel = nextLevel;
            currentLength = nextLevelLength;
            currentIndex = currentIndex / 2;
            proofIndex++;
        }
        
        return proof;
    }
}

