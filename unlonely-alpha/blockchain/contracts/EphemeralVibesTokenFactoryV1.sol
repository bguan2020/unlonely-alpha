// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./EphemeralVibesTokenV1.sol"; // Make sure this import path matches where your token contract is located.

contract EphemeralVibesTokenFactoryV1 is Ownable {

    struct TokenInfo {
        address tokenAddress;
        address ownerAddress;
        uint256 endTimestamp;
    }

    uint256 public numDeployedTokens;
    mapping(address => uint256) public deployedTokenIndices;
    mapping(uint256 => TokenInfo) public deployedTokens;

    uint256 public defaultProtocolFeePercent;
    uint256 public defaultStreamerFeePercent;
    address public defaultFeeDestination;

    // Event to log the creation of a new EphemeralVibesToken.
    event EphemeralVibesTokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol, uint256 endTimestamp);
    event FeeDestinationSet(address indexed feeDestination);
    event ProtocolFeePercentSet(uint256 feePercent);
    event StreamerFeePercentSet(uint256 feePercent);

    constructor(address _defaultFeeDestination, uint256 _defaultProtocolFeePercent, uint256 _defaultStreamerFeePercent) {
        require(_defaultFeeDestination != address(0), "Default fee destination cannot be the zero address");
        
        defaultProtocolFeePercent = _defaultProtocolFeePercent;
        defaultStreamerFeePercent = _defaultStreamerFeePercent;
        defaultFeeDestination = _defaultFeeDestination;
    }

    // This function creates a new EphemeralVibesToken contract.
    function createEphemeralVibesToken(
        string memory name,
        string memory symbol,
        uint256 duration
    ) public returns (address) {
        uint256 endTimestamp = block.timestamp + duration;
        EphemeralVibesTokenV1 newToken = new EphemeralVibesTokenV1(name, symbol, endTimestamp, defaultFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, address(this));        
        
        uint256 index = ++numDeployedTokens;
        deployedTokens[index] = TokenInfo(address(newToken), msg.sender, endTimestamp);
        deployedTokenIndices[address(newToken)] = index;

        newToken.transferOwnership(msg.sender); // Transfer ownership of the new token to the caller of this function.
        emit EphemeralVibesTokenCreated(address(newToken), msg.sender, name, symbol, endTimestamp);
        return address(newToken);
    }

    function setFeeDestination(address _feeDestination) public onlyOwner {
        defaultFeeDestination = _feeDestination;
        emit FeeDestinationSet(_feeDestination);
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwner {
        defaultProtocolFeePercent = _feePercent;
        emit ProtocolFeePercentSet(_feePercent);
    }

    function setStreamerFeePercent(uint256 _feePercent) public onlyOwner {
        defaultStreamerFeePercent = _feePercent;
        emit StreamerFeePercentSet(_feePercent);
    }
}