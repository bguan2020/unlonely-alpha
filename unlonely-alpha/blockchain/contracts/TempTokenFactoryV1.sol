// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./TempTokenV1.sol"; // Make sure this import path matches where your token contract is located.

contract TempTokenFactoryV1 is Ownable {

    /**
        * @dev TokenInfo is a struct to store information about a deployed token.
        * @dev tokenAddress is the address of the deployed token.
        * @dev ownerAddress is the address of the token's owner. This will usually be the owner of the Unlonely channel that is launching this token.
        * @dev name is the name of the token.
        * @dev symbol is the symbol of the token.
        * @dev endTimestamp is the timestamp when the token is no longer tradeable (more information in TempTokenV1 contract).
        * @dev protocolFeeDestination is the address where the protocol fees are sent.
        * @dev protocolFeePercent is the percentage of the protocol fee.
        * @dev streamerFeePercent is the percentage of the streamer fee.
     */
    struct TokenInfo {
        address tokenAddress;
        address ownerAddress;
    }

    /**
        * @dev numDeployedTokens is the number of deployed tokens.
        * @dev deployedTokenIndices is a mapping of token addresses to their assigned index.
        * @dev deployedTokens is a mapping of token indices to TokenInfo structs.
     */
    uint256 public numDeployedTokens;
    mapping(address => uint256) public deployedTokenIndices;
    mapping(uint256 => TokenInfo) public deployedTokens;

    mapping(address => bool) public admins;

    /**
        * @dev defaultProtocolFeePercent is the default protocol fee percentage. ex: 2% = 2 * 10**16 = 20000000000000000.
        * @dev defaultStreamerFeePercent is the default streamer fee percentage. ex: 2% = 2 * 10**16 = 20000000000000000.
        * @dev defaultProtocolFeeDestination is the default protocol fee destination address.
        * @dev isPaused is a boolean to pause the token creation function.
        * @dev maxDuration is the max duration in seconds for the lifespan of the TempToken.
        * @dev totalSupplyThreshold is the total supply needed for the token to convert from a TempToken into a normal, permanent token. 
               This total supply will be adjusted by us depending on various factors.
               The goal of each TempToken is to have hit this threshold by the time the duration has expired.
               IT'S A GAME.
     */
    uint256 public defaultProtocolFeePercent;
    uint256 public defaultStreamerFeePercent;
    address public defaultProtocolFeeDestination;
    bool public isPaused;
    uint256 public maxDuration;
    uint256 public totalSupplyThreshold;

    // Event to log the creation of a new TempToken.
    event TempTokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol, uint256 endTimestamp, address protocolFeeDestination, uint256 protocolFeePercent, uint256 streamerFeePercent, uint256 totalSupplyThreshold);
    event ProtocolFeeDestinationSet(address indexed protocolFeeDestination);
    event ProtocolFeePercentSet(uint256 feePercent);
    event StreamerFeePercentSet(uint256 feePercent);
    event PauseFactorySet(bool isPaused, uint256 numDeployedTokens);
    event MaxDurationSet(uint256 maxDuration);
    event TotalSupplyThresholdSet(uint256 totalSupplyThreshold, address[] tokenAddresses, uint256[] additionalDurations);

    modifier onlyAdmin() {
        require(admins[msg.sender] == true, "not an admin");
        _;
    }

    constructor(address _defaultProtocolFeeDestination, uint256 _defaultProtocolFeePercent, uint256 _defaultStreamerFeePercent, uint256 _totalSupplyThreshold) {
        require(_defaultProtocolFeeDestination != address(0), "Default fee destination cannot be zero");

        defaultProtocolFeePercent = _defaultProtocolFeePercent;
        defaultStreamerFeePercent = _defaultStreamerFeePercent;
        defaultProtocolFeeDestination = _defaultProtocolFeeDestination;
        totalSupplyThreshold = _totalSupplyThreshold;
        maxDuration = 1 hours; // Sets the initial maxDuration to 3600 seconds
    }

    /**
        * @dev createTempToken is a function to create a new TempToken.
        * @dev name is the name of the token.
        * @dev symbol is the symbol of the token.
        * @dev duration is the duration in seconds for the lifespan of the TempToken.
        * @dev The function returns the address of the new TempToken.
     */
    function createTempToken(
        string memory name,
        string memory symbol,
        uint256 duration
    ) public returns (address) {
        require(!isPaused, "Factory is paused");
        require(duration <= maxDuration, "Duration is longer than max duration");
        require(duration > 0, "Duration must be more than 0");
        uint256 endTimestamp = block.timestamp + duration;
        TempTokenV1 newToken = new TempTokenV1(name, symbol, endTimestamp, defaultProtocolFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, totalSupplyThreshold, address(this));        
        
        /**
            * @dev We increment the numDeployedTokens and use the new value as the index to store the TokenInfo struct in the deployedTokens mapping.
            * @dev We also store the index of the token in the deployedTokenIndices mapping using the token's address as the key.
         */
        uint256 index = ++numDeployedTokens;
        deployedTokens[index] = TokenInfo(address(newToken), msg.sender);
        deployedTokenIndices[address(newToken)] = index;

        newToken.transferOwnership(msg.sender); // Transfer ownership of the new token to the caller of this function.
        emit TempTokenCreated(address(newToken), msg.sender, name, symbol, endTimestamp, defaultProtocolFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, totalSupplyThreshold);
        return address(newToken);
    }

    /**
        * @dev getTokenInfo is a function to get the TokenInfo struct of a deployed token.
        * @dev tokenAddress is the address of the deployed token.
        * @dev The function returns the TokenInfo struct of the deployed token.
     */
    function getTokenInfo(address tokenAddress) public view returns (TokenInfo memory) {
        return deployedTokens[deployedTokenIndices[tokenAddress]];
    }

    /**
        * @dev The following functions are used to set the default protocol fee destination, 
                protocol fee percentage, streamer fee percentage, pause the factory, set total supply threshold,
                and set the max duration.
        * @dev These functions are only callable by the owner of the factory.
     */

    function setFeeDestination(address protocolFeeDestination) public onlyOwner {
        require(protocolFeeDestination != address(0), "Fee destination cannot be the zero address");
        defaultProtocolFeeDestination = protocolFeeDestination;
        emit ProtocolFeeDestinationSet(protocolFeeDestination);
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwner {
        defaultProtocolFeePercent = _feePercent;
        emit ProtocolFeePercentSet(_feePercent);
    }

    function setStreamerFeePercent(uint256 _feePercent) public onlyOwner {
        defaultStreamerFeePercent = _feePercent;
        emit StreamerFeePercentSet(_feePercent);
    }

    function setTotalSupplyThresholdForTokens(uint256 _totalSupplyThreshold, address[] calldata _tokenAddresses, uint256[] calldata _additionalDurations) public onlyAdmin onlyOwner {
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            TempTokenV1(_tokenAddresses[i]).updateTotalSupplyThreshold(_totalSupplyThreshold, _additionalDurations[i]);
        }
        // Update the global threshold for future tokens
        totalSupplyThreshold = _totalSupplyThreshold;
        emit TotalSupplyThresholdSet(_totalSupplyThreshold, _tokenAddresses, _additionalDurations);
    }

    function setPauseFactory(bool _isPaused) public onlyAdmin onlyOwner {
        isPaused = _isPaused;
        emit PauseFactorySet(_isPaused, numDeployedTokens);
    }

    function setMaxDuration(uint256 _maxDuration) public onlyAdmin onlyOwner {
        require(_maxDuration > 0, "Max duration must be more than 0");
        maxDuration = _maxDuration;
        emit MaxDurationSet(_maxDuration);
    }

    function setAdmin(address _address, bool _onlyAdmin) public onlyOwner {
        require(_address != address(0), "Admin cannot be zero");
        admins[_address] = _onlyAdmin;
    }
}