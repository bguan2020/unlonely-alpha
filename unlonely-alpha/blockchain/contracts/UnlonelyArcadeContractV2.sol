// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract UnlonelyArcadeContract {
    using SafeERC20 for IERC20;

    address public brian;
    mapping(address => IERC20) public creatorTokens;
    mapping(address => uint256) public tokenPrices;
    mapping(address => address) public tokenOwners;

    constructor() {
        brian = msg.sender;
    }

    modifier onlyBrian() {
        require(msg.sender == brian, "Only Brian can call this function.");
        _;
    }

    function addCreatorToken(address _creatorToken, uint256 _initialPrice, address _tokenOwner) external onlyBrian {
        require(_initialPrice > 0, "Token price must be greater than zero.");
        require(creatorTokens[_creatorToken] == IERC20(address(0)), "Token already exists.");

        creatorTokens[_creatorToken] = IERC20(_creatorToken);
        tokenPrices[_creatorToken] = _initialPrice;
        tokenOwners[_creatorToken] = _tokenOwner;
    }

    function setTokenPrice(address _creatorToken, uint256 _newPrice) external onlyBrian {
        require(_newPrice > 0, "Token price must be greater than zero.");
        require(creatorTokens[_creatorToken] != IERC20(address(0)), "Token does not exist.");

        tokenPrices[_creatorToken] = _newPrice;
    }

    function buyCreatorToken(address _creatorToken, uint256 tokenAmount) payable external {
        require(creatorTokens[_creatorToken] != IERC20(address(0)), "Token does not exist.");
        require(tokenOwners[_creatorToken] != address(0), "Token does not have an owner.");
        // require tokenAmount > 0
        require(tokenAmount > 0, "Token amount must be greater than zero.");

        // Calculate required ETH amount
        uint256 ethAmount = calculateEthAmount(_creatorToken, tokenAmount);

        require(msg.value >= ethAmount, "Insufficient Ether sent.");

        // TODO: send ETH to the owner of the creator token
        // Send ETH to Brian
        (bool sent,) = payable(tokenOwners[_creatorToken]).call{value: msg.value}("");
        require(sent, "Failed to transfer Ether");

        // Transfer CreatorToken to the buyer
        creatorTokens[_creatorToken].safeTransferFrom(brian, msg.sender, tokenAmount);
    }

    function useFeature(address _creatorToken, uint256 _featurePrice) external {
        require(creatorTokens[_creatorToken] != IERC20(address(0)), "Token does not exist.");

        // Check if the user has enough tokens
        require(creatorTokens[_creatorToken].balanceOf(msg.sender) >= _featurePrice, "Insufficient CreatorToken balance");

        // Transfer tokens from the user to Brian
        creatorTokens[_creatorToken].safeTransferFrom(msg.sender, brian, _featurePrice);

        // Implement the actual feature usage logic here
    }

    function calculateEthAmount(address _creatorToken, uint256 tokenAmount) public view returns (uint256) {
        require(creatorTokens[_creatorToken] != IERC20(address(0)), "Token does not exist.");

        return tokenAmount / tokenPrices[_creatorToken];
    }
}
