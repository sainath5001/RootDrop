// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRUNESToken} from "../interfaces/IRUNESToken.sol";

/**
 * @title MockRUNESToken
 * @notice Mock implementation of RUNES token for testing purposes
 * @dev Simple ERC20-like token that implements IRUNESToken interface
 */
contract MockRUNESToken is IRUNESToken {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    string public name;
    string public symbol;
    uint8 public decimals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = initialSupply;
        _balances[msg.sender] = initialSupply;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(
        address to,
        uint256 amount
    ) external override returns (bool) {
        require(to != address(0), "MockRUNES: transfer to zero address");
        require(_balances[msg.sender] >= amount, "MockRUNES: insufficient balance");

        _balances[msg.sender] -= amount;
        _balances[to] += amount;

        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external override returns (bool) {
        require(to != address(0), "MockRUNES: transfer to zero address");
        require(_balances[from] >= amount, "MockRUNES: insufficient balance");
        require(
            _allowances[from][msg.sender] >= amount,
            "MockRUNES: insufficient allowance"
        );

        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;

        return true;
    }

    function approve(
        address spender,
        uint256 amount
    ) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }

    function allowance(
        address owner,
        address spender
    ) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @notice Mint tokens to an address (for testing)
     */
    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
    }
}

