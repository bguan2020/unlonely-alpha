// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./TempTokenV1.sol"; // Make sure this import path matches where your token contract is located.

contract TempTokenFactoryV1 is Ownable {

    // Here we have a struct to store information about each token that is deployed.
    struct TokenInfo {
        address tokenAddress;
        address ownerAddress;
        uint256 endTimestamp;
    }

    /**
        * @dev numDeployedTokens is the number of deployed tokens.
        * @dev deployedTokenIndices is a mapping of token addresses to their assigned index.
        * @dev deployedTokens is a mapping of token indices to TokenInfo structs.
     */
    uint256 public numDeployedTokens;
    mapping(address => uint256) public deployedTokenIndices;
    mapping(uint256 => TokenInfo) public deployedTokens;

    /**
        * @dev defaultProtocolFeePercent is the default protocol fee percentage. ex: 2% = 2 * 10**16 = 20000000000000000.
        * @dev defaultStreamerFeePercent is the default streamer fee percentage. ex: 2% = 2 * 10**16 = 20000000000000000.
        * @dev defaultFeeDestination is the default fee destination address.
        * @dev isPaused is a boolean to pause the factory and its token creation function.
        * @dev duration is the default duration in seconds for the lifespan of a token.
     */
    uint256 public defaultProtocolFeePercent;
    uint256 public defaultStreamerFeePercent;
    address public defaultFeeDestination;
    bool public isPaused;
    uint256 public duration;

    // Event to log the creation of a new TempToken.
    event TempTokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol, uint256 endTimestamp);
    event FeeDestinationSet(address indexed feeDestination);
    event ProtocolFeePercentSet(uint256 feePercent);
    event StreamerFeePercentSet(uint256 feePercent);
    event PauseFactorySet(bool isPaused, uint256 numDeployedTokens);
    event DurationSet(uint256 duration);

    constructor(address _defaultFeeDestination, uint256 _defaultProtocolFeePercent, uint256 _defaultStreamerFeePercent) {
        require(_defaultFeeDestination != address(0), "Default fee destination cannot be the zero address");

        defaultProtocolFeePercent = _defaultProtocolFeePercent;
        defaultStreamerFeePercent = _defaultStreamerFeePercent;
        defaultFeeDestination = _defaultFeeDestination;
        duration = 1 hours; // Sets the initial duration to 3600 seconds
    }

    // This function creates a new TempToken contract.
    function createTempToken(
        string memory name,
        string memory symbol
    ) public returns (address) {
        require(!isPaused, "Factory is paused");
        uint256 endTimestamp = block.timestamp + duration;
        TempTokenV1 newToken = new TempTokenV1(name, symbol, endTimestamp, defaultFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, address(this));        
        
        /**
            * @dev We increment the numDeployedTokens and use the new value as the index to store the TokenInfo struct in the deployedTokens mapping.
            * @dev We also store the index of the token in the deployedTokenIndices mapping using the token's address as the key.
         */
        uint256 index = ++numDeployedTokens;
        deployedTokens[index] = TokenInfo(address(newToken), msg.sender, endTimestamp);
        deployedTokenIndices[address(newToken)] = index;

        newToken.transferOwnership(msg.sender); // Transfer ownership of the new token to the caller of this function.
        emit TempTokenCreated(address(newToken), msg.sender, name, symbol, endTimestamp);
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

    function setPauseFactory(bool _isPaused) public onlyOwner {
        isPaused = _isPaused;
        emit PauseFactorySet(_isPaused, numDeployedTokens);
    }

    function setDuration(uint256 _duration) public onlyOwner {
        duration = _duration;
        emit DurationSet(_duration);
    }

    function getTokenInfo(address tokenAddress) public view returns (TokenInfo memory) {
        uint256 index = deployedTokenIndices[tokenAddress];
        return deployedTokens[index];
    }
}