// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UnlonelyCreatorToken is ERC20 {
    // Using a struct for better readability
    struct Holder {
        address account;
        uint256 amount;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner,
        Holder[] memory initialHolders
    ) ERC20(name, symbol) {
        _mint(owner, initialSupply);

        // Distributing tokens to the initial holders from Mainnet to L2
        for (uint i = 0; i < initialHolders.length; i++) {
            _transfer(owner, initialHolders[i].account, initialHolders[i].amount);
        }
    }
}
