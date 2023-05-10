// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract ContractA {
    using SafeERC20 for IERC20;

    address public brian;
    IERC20 public creatorToken;
    uint256 public tokenPrice;

    constructor(address _creatorToken, uint256 _tokenPrice) {
        require(_tokenPrice > 0, "Token price must be greater than zero.");
        brian = msg.sender;
        creatorToken = IERC20(_creatorToken);
        tokenPrice = _tokenPrice;
    }

    modifier onlyBrian() {
        require(msg.sender == brian, "Only Brian can call this function.");
        _;
    }

    function setTokenPrice(uint256 _newPrice) external onlyBrian {
        require(_newPrice > 0, "Token price must be greater than zero.");
        tokenPrice = _newPrice;
    }

    function buyCreatorToken(uint256 tokenAmount) payable external {
        // Calculate required ETH amount
        uint256 ethAmount = calculateEthAmount(tokenAmount);

        require(msg.value >= ethAmount, "Insufficient Ether sent.");

        // Send ETH to Brian
        (bool sent,) = payable(brian).call{value: msg.value}("");
        require(sent, "Failed to transfer Ether");

        // Transfer CreatorToken to the buyer
        creatorToken.safeTransferFrom(brian, msg.sender, tokenAmount);
    }

    function useFeature(uint256 times, uint256 _featurePrice) external {
        uint256 cost = _featurePrice * times;

        // Check if the user has enough tokens
        require(creatorToken.balanceOf(msg.sender) >= cost, "Insufficient CreatorToken balance");

        // Transfer tokens from the user to Brian
        creatorToken.safeTransferFrom(msg.sender, brian, cost);

        // Implement the actual feature usage logic here
    }

    function calculateEthAmount(uint256 tokenAmount) internal view returns (uint256) {
        require(tokenPrice > 0, "Token price must be greater than zero.");
        return tokenAmount / tokenPrice;
    }
}