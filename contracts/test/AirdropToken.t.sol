// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {AirdropToken} from "../src/AirdropToken.sol";

contract AirdropTokenTest is Test {
    AirdropToken public token;
    address public admin = address(0x1);
    address public minter = address(0x2);
    address public user = address(0x3);

    uint256 public constant TOKEN_ID_1 = 1;
    uint256 public constant TOKEN_ID_2 = 2;
    uint256 public constant AMOUNT = 100;

    function setUp() public {
        vm.prank(admin);
        token = new AirdropToken("https://example.com/api/token/{id}.json", admin);
    }

    function test_Mint() public {
        vm.startPrank(admin);
        token.mint(user, TOKEN_ID_1, AMOUNT, "");
        vm.stopPrank();

        assertEq(token.balanceOf(user, TOKEN_ID_1), AMOUNT);
        assertEq(token.totalSupply(TOKEN_ID_1), AMOUNT);
    }

    function test_BatchMint() public {
        vm.startPrank(admin);
        
        uint256[] memory ids = new uint256[](2);
        ids[0] = TOKEN_ID_1;
        ids[1] = TOKEN_ID_2;
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = AMOUNT;
        amounts[1] = AMOUNT * 2;
        
        token.batchMint(user, ids, amounts, "");
        vm.stopPrank();

        assertEq(token.balanceOf(user, TOKEN_ID_1), AMOUNT);
        assertEq(token.balanceOf(user, TOKEN_ID_2), AMOUNT * 2);
    }

    function test_BatchMintToMany() public {
        vm.startPrank(admin);
        
        address[] memory recipients = new address[](3);
        recipients[0] = address(0x10);
        recipients[1] = address(0x11);
        recipients[2] = address(0x12);
        
        token.batchMintToMany(recipients, TOKEN_ID_1, AMOUNT);
        vm.stopPrank();

        assertEq(token.balanceOf(recipients[0], TOKEN_ID_1), AMOUNT);
        assertEq(token.balanceOf(recipients[1], TOKEN_ID_1), AMOUNT);
        assertEq(token.balanceOf(recipients[2], TOKEN_ID_1), AMOUNT);
    }

    function test_SetTokenURI() public {
        vm.startPrank(admin);
        token.setTokenURI(TOKEN_ID_1, "https://example.com/token/1.json");
        vm.stopPrank();

        assertEq(token.uri(TOKEN_ID_1), "https://example.com/token/1.json");
    }

    function test_Mint_RevertIf_NotMinter() public {
        vm.prank(user);
        vm.expectRevert();
        token.mint(user, TOKEN_ID_1, AMOUNT, "");
    }
}

