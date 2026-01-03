// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IRUNESToken} from "./interfaces/IRUNESToken.sol";

/**
 * @title AirdropEngine
 * @notice Manages ERC-1155 and RUNES token airdrop campaigns with Merkle proof verification
 * @dev Supports both ERC1155 tokens and bridged RUNES tokens (ERC20-like)
 */
contract AirdropEngine is AccessControl, IERC1155Receiver {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @notice Campaign structure
    struct Campaign {
        address tokenContract; // ERC1155 contract address or RUNES token address
        bool isRunesToken; // true if using RUNES token, false if ERC1155
        uint256[] tokenIds; // For ERC1155: token IDs, for RUNES: ignored (use 0)
        bytes32 merkleRoot; // Merkle root for eligibility verification
        string metadata; // Campaign metadata (JSON string)
        uint256 startTime; // Campaign start timestamp
        uint256 endTime; // Campaign end timestamp
        bool active; // Whether campaign is active
        uint256 totalClaimed; // Total amount claimed across all tokens
    }

    /// @notice Mapping from campaign ID to campaign data
    mapping(uint256 => Campaign) public campaigns;

    /// @notice Mapping to track claimed leaves (campaignId => leafHash => claimed)
    mapping(uint256 => mapping(bytes32 => bool)) public claimed;

    /// @notice Counter for campaign IDs
    uint256 public campaignCounter;

    /// @notice Emitted when a new campaign is created
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed tokenContract,
        bool isRunesToken,
        uint256[] tokenIds,
        bytes32 merkleRoot,
        uint256 startTime,
        uint256 endTime,
        string metadata
    );

    /// @notice Emitted when a user claims tokens
    event Claimed(
        uint256 indexed campaignId, address indexed claimant, uint256 tokenId, uint256 amount, bytes32 leafHash
    );

    /// @notice Emitted when admin performs batch airdrop
    event BatchDistributed(uint256 indexed campaignId, address[] recipients, uint256[] tokenIds, uint256[] amounts);

    /// @notice Emitted when campaign status is updated
    event CampaignStatusUpdated(uint256 indexed campaignId, bool active);

    /**
     * @notice Constructor sets up the engine with initial admin
     * @param admin Address to receive admin role
     */
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
    }

    /**
     * @notice Create a new airdrop campaign
     * @param tokenContract Address of ERC1155 contract or RUNES token
     * @param isRunesToken Whether the token is a RUNES token (true) or ERC1155 (false)
     * @param tokenIds Array of token IDs (for ERC1155) or empty array (for RUNES)
     * @param merkleRoot Merkle root for eligibility verification
     * @param metadata Campaign metadata (JSON string)
     * @param startTime Campaign start timestamp
     * @param endTime Campaign end timestamp
     * @return campaignId The ID of the newly created campaign
     */
    function createCampaign(
        address tokenContract,
        bool isRunesToken,
        uint256[] memory tokenIds,
        bytes32 merkleRoot,
        string memory metadata,
        uint256 startTime,
        uint256 endTime
    ) public onlyRole(ADMIN_ROLE) returns (uint256) {
        require(tokenContract != address(0), "AirdropEngine: invalid token contract");
        require(merkleRoot != bytes32(0), "AirdropEngine: invalid merkle root");
        require(startTime < endTime, "AirdropEngine: invalid time range");
        require(!isRunesToken || tokenIds.length == 0, "AirdropEngine: RUNES campaigns should have empty tokenIds");
        require(isRunesToken || tokenIds.length > 0, "AirdropEngine: ERC1155 campaigns must have tokenIds");

        uint256 campaignId = campaignCounter;
        campaignCounter++;

        campaigns[campaignId] = Campaign({
            tokenContract: tokenContract,
            isRunesToken: isRunesToken,
            tokenIds: tokenIds,
            merkleRoot: merkleRoot,
            metadata: metadata,
            startTime: startTime,
            endTime: endTime,
            active: true,
            totalClaimed: 0
        });

        emit CampaignCreated(
            campaignId, tokenContract, isRunesToken, tokenIds, merkleRoot, startTime, endTime, metadata
        );

        return campaignId;
    }

    /**
     * @notice Claim tokens from a campaign using Merkle proof
     * @param campaignId ID of the campaign
     * @param tokenId Token ID to claim (for ERC1155) or 0 (for RUNES)
     * @param amount Amount of tokens to claim
     * @param merkleProof Merkle proof for eligibility verification
     */
    function claim(uint256 campaignId, uint256 tokenId, uint256 amount, bytes32[] calldata merkleProof) public {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.active, "AirdropEngine: campaign not active");
        require(block.timestamp >= campaign.startTime, "AirdropEngine: campaign not started");
        require(block.timestamp <= campaign.endTime, "AirdropEngine: campaign ended");

        // Verify tokenId is valid for the campaign
        if (campaign.isRunesToken) {
            require(tokenId == 0, "AirdropEngine: invalid tokenId for RUNES");
        } else {
            bool validTokenId = false;
            for (uint256 i = 0; i < campaign.tokenIds.length; i++) {
                if (campaign.tokenIds[i] == tokenId) {
                    validTokenId = true;
                    break;
                }
            }
            require(validTokenId, "AirdropEngine: invalid tokenId");
        }

        // Create leaf hash: keccak256(abi.encodePacked(campaignId, msg.sender, tokenId, amount))
        bytes32 leaf = keccak256(abi.encodePacked(campaignId, msg.sender, tokenId, amount));

        // Check if already claimed
        require(!claimed[campaignId][leaf], "AirdropEngine: already claimed");

        // Verify Merkle proof
        require(MerkleProof.verify(merkleProof, campaign.merkleRoot, leaf), "AirdropEngine: invalid proof");

        // Mark as claimed
        claimed[campaignId][leaf] = true;
        campaign.totalClaimed += amount;

        // Distribute tokens
        if (campaign.isRunesToken) {
            // Transfer RUNES tokens
            IRUNESToken runesToken = IRUNESToken(campaign.tokenContract);
            require(runesToken.transfer(msg.sender, amount), "AirdropEngine: RUNES transfer failed");
        } else {
            // Transfer ERC1155 tokens
            IERC1155 erc1155Token = IERC1155(campaign.tokenContract);
            erc1155Token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
        }

        emit Claimed(campaignId, msg.sender, tokenId, amount, leaf);
    }

    /**
     * @notice Batch airdrop tokens to multiple recipients (admin only)
     * @param campaignId ID of the campaign
     * @param recipients Array of recipient addresses
     * @param tokenIds Array of token IDs (must match recipients length)
     * @param amounts Array of amounts (must match recipients length)
     */
    function batchAirdrop(
        uint256 campaignId,
        address[] memory recipients,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) public onlyRole(OPERATOR_ROLE) {
        require(
            recipients.length == tokenIds.length && recipients.length == amounts.length,
            "AirdropEngine: array length mismatch"
        );

        Campaign storage campaign = campaigns[campaignId];
        require(campaign.active, "AirdropEngine: campaign not active");

        uint256 length = recipients.length;
        for (uint256 i = 0; i < length;) {
            if (campaign.isRunesToken) {
                IRUNESToken runesToken = IRUNESToken(campaign.tokenContract);
                require(runesToken.transfer(recipients[i], amounts[i]), "AirdropEngine: RUNES transfer failed");
            } else {
                IERC1155 erc1155Token = IERC1155(campaign.tokenContract);
                erc1155Token.safeTransferFrom(address(this), recipients[i], tokenIds[i], amounts[i], "");
            }
            unchecked {
                ++i;
            }
        }

        emit BatchDistributed(campaignId, recipients, tokenIds, amounts);
    }

    /**
     * @notice Update campaign active status
     * @param campaignId ID of the campaign
     * @param active New active status
     */
    function setCampaignActive(uint256 campaignId, bool active) public onlyRole(ADMIN_ROLE) {
        require(campaigns[campaignId].tokenContract != address(0), "AirdropEngine: campaign does not exist");
        campaigns[campaignId].active = active;
        emit CampaignStatusUpdated(campaignId, active);
    }

    /**
     * @notice Get campaign details
     * @param campaignId ID of the campaign
     * @return Campaign struct with all campaign data
     */
    function getCampaign(uint256 campaignId) public view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    /**
     * @notice Check if a leaf has been claimed
     * @param campaignId ID of the campaign
     * @param leafHash Hash of the leaf to check
     * @return Whether the leaf has been claimed
     */
    function isClaimed(uint256 campaignId, bytes32 leafHash) public view returns (bool) {
        return claimed[campaignId][leafHash];
    }

    /**
     * @notice Required by IERC1155Receiver - handles incoming ERC1155 tokens
     */
    function onERC1155Received(address, address, uint256, uint256, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        return this.onERC1155Received.selector;
    }

    /**
     * @notice Required by IERC1155Receiver - handles batch incoming ERC1155 tokens
     */
    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        return this.onERC1155BatchReceived.selector;
    }

    /**
     * @notice Check interface support
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC1155Receiver).interfaceId || super.supportsInterface(interfaceId);
    }
}
