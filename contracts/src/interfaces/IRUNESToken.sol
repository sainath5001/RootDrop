// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRUNESToken
 * @notice Interface for bridged RUNES tokens on Rootstock
 * @dev RUNES tokens bridged from Bitcoin are ERC20-like tokens
 *      This interface allows the AirdropEngine to work with both ERC1155 and RUNES tokens
 */
interface IRUNESToken {
    /**
     * @notice Transfer tokens to a recipient
     * @param to Address to transfer tokens to
     * @param amount Amount of tokens to transfer
     * @return success Whether the transfer was successful
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @notice Transfer tokens from one address to another (requires approval)
     * @param from Address to transfer tokens from
     * @param to Address to transfer tokens to
     * @param amount Amount of tokens to transfer
     * @return success Whether the transfer was successful
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    /**
     * @notice Get the balance of an address
     * @param account Address to check balance for
     * @return balance Token balance of the account
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @notice Get the total supply of tokens
     * @return supply Total token supply
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Approve spender to transfer tokens on behalf of the caller
     * @param spender Address to approve
     * @param amount Amount to approve
     * @return success Whether the approval was successful
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @notice Get the allowance of a spender for an owner
     * @param owner Address that owns the tokens
     * @param spender Address that is approved to spend
     * @return allowance Amount of tokens approved
     */
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}

