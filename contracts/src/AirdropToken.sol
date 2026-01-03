// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title AirdropToken
 * @notice ERC-1155 token contract with minting capabilities for airdrop campaigns
 * @dev Extends OpenZeppelin's ERC1155 with AccessControl and Supply tracking
 */
contract AirdropToken is ERC1155, AccessControl, ERC1155Supply {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Mapping to track token URIs for each token ID
    mapping(uint256 => string) private _tokenURIs;

    /// @notice Emitted when a new token URI is set
    event TokenURIUpdated(uint256 indexed tokenId, string uri);

    /**
     * @notice Constructor sets up the token with initial admin
     * @param baseURI Base URI for token metadata
     * @param admin Address to receive admin role
     */
    constructor(string memory baseURI, address admin) ERC1155(baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    /**
     * @notice Mint tokens to a single address
     * @param to Address to receive tokens
     * @param id Token ID to mint
     * @param amount Amount of tokens to mint
     * @param data Additional data to pass with mint
     */
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyRole(MINTER_ROLE) {
        _mint(to, id, amount, data);
    }

    /**
     * @notice Batch mint tokens to a single address
     * @param to Address to receive tokens
     * @param ids Array of token IDs to mint
     * @param amounts Array of amounts corresponding to each token ID
     * @param data Additional data to pass with mint
     */
    function batchMint(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @notice Batch mint tokens to multiple addresses (gas optimized)
     * @param recipients Array of addresses to receive tokens
     * @param id Token ID to mint to all recipients
     * @param amount Amount of tokens to mint to each recipient
     */
    function batchMintToMany(address[] memory recipients, uint256 id, uint256 amount) public onlyRole(MINTER_ROLE) {
        uint256 length = recipients.length;
        for (uint256 i = 0; i < length;) {
            _mint(recipients[i], id, amount, "");
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Set URI for a specific token ID
     * @param tokenId Token ID to set URI for
     * @param tokenURI URI string for the token
     */
    function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyRole(ADMIN_ROLE) {
        _tokenURIs[tokenId] = tokenURI;
        emit TokenURIUpdated(tokenId, tokenURI);
    }

    /**
     * @notice Get URI for a specific token ID
     * @param tokenId Token ID to get URI for
     * @return URI string for the token
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }
        return super.uri(tokenId);
    }

    /**
     * @notice Override required by Solidity for multiple inheritance
     */
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    /**
     * @notice Check if contract supports an interface
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
