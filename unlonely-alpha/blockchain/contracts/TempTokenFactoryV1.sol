// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./TempTokenV1.sol"; // Make sure this import path matches where your token contract is located.
import "@openzeppelin/contracts/access/Ownable.sol";

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
        * @dev creationBlockNumber is the block number when the token was created.
     */
    struct TokenInfo {
        address tokenAddress;
        address ownerAddress;
        string name;
        string symbol;
        uint256 endTimestamp;
        address protocolFeeDestination;
        uint256 protocolFeePercent;
        uint256 streamerFeePercent;
        uint256 creationBlockNumber;
        uint256 preSaleEndTimestamp;
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
        * @dev admins is a mapping of addresses to a boolean value.
            If the boolean value is true, the address is an admin.
            If the boolean value is false, the address is not an admin.
    */
    mapping(address => bool) public admins;
    /**
        * @dev defaultProtocolFeePercent is the default protocol fee percentage. ex: 2% = 2 * 10**16 = 20000000000000000.
        * @dev defaultStreamerFeePercent is the default streamer fee percentage. ex: 2% = 2 * 10**16 = 20000000000000000.
        * @dev defaultProtocolFeeDestination is the default protocol fee destination address.
        * @dev isPaused is a boolean to pause the token creation function.
        * @dev maxDuration is the max duration in seconds for the lifespan of the TempToken.
        * @dev totalSupplyThreshold is the total supply needed for the token to increase its lifespan by 24 hours. 
               This total supply will be adjusted by us depending on various factors.
               The goal of each TempToken is to have hit this threshold by the time the duration has expired.
               IT'S A GAME.
     */
    uint256 public defaultProtocolFeePercent;
    uint256 public defaultStreamerFeePercent;
    address public defaultProtocolFeeDestination;
    bool public isPaused;
    uint256 public maxDuration;

    event TempTokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol, uint256 endTimestamp, uint256 protocolFeePercent, uint256 streamerFeePercent, uint256 totalSupplyThreshold, uint256 creationBlockNumber, uint256 preSaleEndTimestamp);
    event MultipleTempTokensCreated(address[] tokenAddresses, address indexed owner, string[] names, string[] symbols, uint256 endTimestamp, address protocolFeeDestination, uint256 protocolFeePercent, uint256 streamerFeePercent, uint256 totalSupplyThreshold, uint256 creationBlockNumber, uint256 preSaleEndTimestamp);
    event ProtocolFeeDestinationSet(address indexed protocolFeeDestination);
    event ProtocolFeePercentSet(uint256 feePercent);
    event StreamerFeePercentSet(uint256 feePercent);
    event PauseFactorySet(bool isPaused, uint256 numDeployedTokens);
    event MaxDurationSet(uint256 maxDuration);
    event TotalSupplyThresholdSetForTokens(uint256 totalSupplyThreshold, address[] tokenAddresses);
    event EndTimestampIncreasedForTokens(uint256 additionalDuration, address[] tokenAddresses);
    event AlwaysTradeableSetForTokens(address[] tokenAddresses);
    event SetWinningTokenTradeableAndTransferredLiquidity(address winnerTokenAddress, address loserTokenAddress, uint256 winnerTotalSupply, uint256 loserTotalSupply, uint256 transferredLiquidity);
    event FactoryMintedWinnerTokens(address winnerTokenAddress, uint256 amount);
    event EtherReceived(address indexed sender, uint256 amount);

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender] == true, "Caller is neither owner nor admin");
        _;
    }

    constructor(address _defaultProtocolFeeDestination, uint256 _defaultProtocolFeePercent, uint256 _defaultStreamerFeePercent) {
        require(_defaultProtocolFeeDestination != address(0), "Default fee destination cannot be zero");

        defaultProtocolFeePercent = _defaultProtocolFeePercent;
        defaultStreamerFeePercent = _defaultStreamerFeePercent;
        defaultProtocolFeeDestination = _defaultProtocolFeeDestination;
        maxDuration = 1 hours; // Sets the initial maxDuration to 3600 seconds
    }

    /**
        * @dev createTempToken is a function to create a new TempToken.
        * @dev name is the name of the token.
        * @dev symbol is the symbol of the token.
        * @dev duration is the duration in seconds for the lifespan of the TempToken.
        * @dev totalSupplyThreshold is the total supply needed for the token to convert from a TempToken into a normal, permanent token. Enter 0 if you don't want to set a threshold.
        * @dev preSaleDuration is the duration in seconds for the pre-sale period of the TempToken.
        * @dev The function returns the address of the new TempToken.
     */
    function createTempToken(
        string memory name,
        string memory symbol,
        uint256 duration,
        uint256 totalSupplyThreshold,
        uint256 preSaleDuration
    ) public returns (address) {
        require(!isPaused, "Factory is paused");
        require(duration <= maxDuration, "Duration is longer than max duration");
        require(duration > 0, "Duration cannot be 0");
        uint256 endTimestamp = block.timestamp + duration;
        uint256 preSaleEndTimestamp = block.timestamp + preSaleDuration;
        uint256 creationBlockNumber = block.number;
        TempTokenV1 newToken = new TempTokenV1(name, symbol, endTimestamp, defaultProtocolFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, totalSupplyThreshold, address(this), creationBlockNumber, preSaleEndTimestamp);        
        
        /**
            * @dev We increment the numDeployedTokens and use the new value as the index to store the TokenInfo struct in the deployedTokens mapping.
            * @dev We also store the index of the token in the deployedTokenIndices mapping using the token's address as the key.
         */
        uint256 index = ++numDeployedTokens;
        deployedTokens[index] = TokenInfo(address(newToken), msg.sender, name, symbol, endTimestamp, defaultProtocolFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, creationBlockNumber, preSaleEndTimestamp);
        deployedTokenIndices[address(newToken)] = index;

        newToken.transferOwnership(msg.sender); // Transfer ownership of the new token to the caller of this function.
        emit TempTokenCreated(address(newToken), msg.sender, name, symbol, endTimestamp, defaultProtocolFeePercent, defaultStreamerFeePercent, totalSupplyThreshold, creationBlockNumber, preSaleEndTimestamp);
        return address(newToken);
    }

/**
        * @dev createMultipleTempTokens is a function to create multiple TempTokens.
        * @dev names is the array of names for the tokens
        * @dev symbols is the array of symbols for the tokens
        * @dev duration is the duration in seconds for the lifespan of the TempTokens.
        * @dev totalSupplyThreshold is the total supply needed for the token to convert from a TempToken into a normal, permanent token. Enter 0 if you don't want to set a threshold.
        * @dev preSaleDuration is the duration in seconds for the pre-sale period of the TempTokens.
        * @dev The function returns the addresses of the new TempTokens.
 */
    function createMultipleTempTokens(
        string[] memory names,
        string[] memory symbols,
        uint256 duration,
        uint256 totalSupplyThreshold,
        uint256 preSaleDuration
    ) public returns (address[] memory) {
        require(!isPaused, "Factory is paused");
        require(duration <= maxDuration, "Duration is longer than max duration");
        require(duration > 0, "Duration cannot be 0");
        require(names.length > 1, "Names array must have more than 1 element");
        require(names.length == symbols.length, "Names and symbols arrays are not the same length");
        address[] memory tokenAddresses = new address[](names.length);
        uint256 endTimestamp = block.timestamp + duration;
        uint256 preSaleEndTimestamp = block.timestamp + preSaleDuration;
        uint256 creationBlockNumber = block.number;
        for (uint256 i = 0; i < names.length; i++) {
            TempTokenV1 newToken = new TempTokenV1(names[i], symbols[i], endTimestamp, defaultProtocolFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, totalSupplyThreshold, address(this), creationBlockNumber, preSaleEndTimestamp);
            uint256 index = ++numDeployedTokens;
            deployedTokens[index] = TokenInfo(address(newToken), msg.sender, names[i], symbols[i], endTimestamp, defaultProtocolFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, creationBlockNumber, preSaleEndTimestamp);
            deployedTokenIndices[address(newToken)] = index;
            newToken.transferOwnership(msg.sender);
            tokenAddresses[i] = address(newToken);
        }
        emit MultipleTempTokensCreated(tokenAddresses, msg.sender, names, symbols, endTimestamp, defaultProtocolFeeDestination, defaultProtocolFeePercent, defaultStreamerFeePercent, totalSupplyThreshold, creationBlockNumber, preSaleEndTimestamp);
        return tokenAddresses;
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

    function setFeeDestination(address protocolFeeDestination) public onlyOwnerOrAdmin {
        require(protocolFeeDestination != address(0), "Fee destination cannot be the zero address");
        defaultProtocolFeeDestination = protocolFeeDestination;
        emit ProtocolFeeDestinationSet(protocolFeeDestination);
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwnerOrAdmin {
        defaultProtocolFeePercent = _feePercent;
        emit ProtocolFeePercentSet(_feePercent);
    }

    function setStreamerFeePercent(uint256 _feePercent) public onlyOwnerOrAdmin {
        defaultStreamerFeePercent = _feePercent;
        emit StreamerFeePercentSet(_feePercent);
    }

    /**
        * @dev The following functions are used to set the total supply threshold for tokens, 
                increase the end timestamp for tokens, set the max duration, and pause the factory.
        * @dev These functions are only callable by the owner or an admin of the factory.
        * @dev This function is used to set the total supply threshold for this factory and tokens, only callable by owner, _tokenAddressses array does not need to be defined
     */

    function setTotalSupplyThresholdForTokens(uint256 _totalSupplyThreshold, address[] calldata _tokenAddresses) public onlyOwnerOrAdmin {
        require(_tokenAddresses.length > 0, "Token addresses array is empty");
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            TempTokenV1(_tokenAddresses[i]).updateTotalSupplyThreshold(_totalSupplyThreshold);
        }
        emit TotalSupplyThresholdSetForTokens(_totalSupplyThreshold, _tokenAddresses);
    }

    /**
        @dev This function is used to increase the end timestamp for tokens, only callable by owner, _tokenAddressses array must be defined
     */
    function increaseEndTimestampForTokens(uint256 _additionalDurationInSeconds, address[] calldata _tokenAddresses) public onlyOwnerOrAdmin {
        require(_additionalDurationInSeconds > 0, "Additional duration cannot be 0");
        require(_tokenAddresses.length > 0, "Token addresses array is empty");
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            TempTokenV1(_tokenAddresses[i]).increaseEndTimestamp(_additionalDurationInSeconds);
        }
        emit EndTimestampIncreasedForTokens(_additionalDurationInSeconds, _tokenAddresses);
    }

        /**
        @dev This function is used to set the always tradeable flag for tokens, only callable by owner, _tokenAddressses array must be defined
     */

    function setAlwaysTradeableForTokens(address[] calldata _tokenAddresses) public onlyOwnerOrAdmin {
        require(_tokenAddresses.length > 0, "Token addresses array is empty");
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            TempTokenV1(_tokenAddresses[i]).setAlwaysTradeable();
        }
        emit AlwaysTradeableSetForTokens(_tokenAddresses);
    }

    /**
      * VERSUS mode only (these functions are called on tokens that compete against each other instead of trying to reach a threshold)
      * @dev setWinningTokenTradeableAndTransferLiquidity is a function to set the winning token as tradeable and transfer all liquidity (if any) 
      * from the losing token to the factory.
      */
    function setWinningTokenTradeableAndTransferLiquidity(address _winningTokenAddress, address _losingTokenAddress) public {
        require(_winningTokenAddress != address(0) && _losingTokenAddress != address(0), "One or both token addresses are zero.");
        
        TempTokenV1 winningToken = TempTokenV1(_winningTokenAddress);
        TempTokenV1 losingToken = TempTokenV1(_losingTokenAddress);

        require(winningToken.owner() == msg.sender && losingToken.owner() == msg.sender, "Caller is not the owner of both tokens");
        require(winningToken.creationBlockNumber() == losingToken.creationBlockNumber(), "Tokens were not created in the same block");
        require(winningToken.endTimestamp() < block.timestamp && losingToken.endTimestamp() < block.timestamp, "Both tokens must expire first");

        winningToken.setAlwaysTradeable();
        uint256 transferredLiquidity = 0;
        if (losingToken.getBalance() > 0) transferredLiquidity = losingToken.transferLiquidityToFactory();

        emit SetWinningTokenTradeableAndTransferredLiquidity(_winningTokenAddress, _losingTokenAddress, winningToken.totalSupply(), losingToken.totalSupply(), transferredLiquidity);
    }
    
    /**
        * VERSUS mode only (these functions are called on tokens that compete against each other instead of trying to reach a threshold)
        * @dev mintWinnerTokens is a function that mints the winner tokens. 
        * This factory does not have a burn function to bring the price down, 
        * this ensures the token's supply has a fixed offset.
     */
    function mintWinnerTokens(address _winnerTokenAddress, uint256 _amount) public {
        require(_winnerTokenAddress != address(0), "Winner token address cannot be zero.");
        TempTokenV1 winnerToken = TempTokenV1(_winnerTokenAddress);
        require(winnerToken.owner() == msg.sender, "Caller is not the owner of this token");
        require(winnerToken.isAlwaysTradeable(), "Winner token is not set to always tradeable");
        require(winnerToken.balanceOf(address(this)) == 0, "Factory already owns winner tokens");

        uint256 requiredEthCost = winnerToken.mintCostAfterFees(_amount);
        if (requiredEthCost >= address(this).balance) {
            revert("Factory does not have enough ETH to mint winner tokens");
        }

        // Call the mint function on the winnerToken contract and send Ether with the call
        (bool success, ) = address(winnerToken).call{value: requiredEthCost}(abi.encodeWithSignature("mint(uint256)", _amount));
        require(success, "Minting failed");
        emit FactoryMintedWinnerTokens(_winnerTokenAddress, _amount);
    }

    function setMaxDuration(uint256 _maxDuration) public onlyOwnerOrAdmin {
        require(_maxDuration > 0, "Max duration cannot be 0");
        maxDuration = _maxDuration;
        emit MaxDurationSet(_maxDuration);
    }

    function setPauseFactory(bool _isPaused) public onlyOwnerOrAdmin {
        isPaused = _isPaused;
        emit PauseFactorySet(_isPaused, numDeployedTokens);
    }

    function setAdmin(address _address, bool _onlyAdmin) public onlyOwner {
        require(_address != address(0), "Admin cannot be zero");
        admins[_address] = _onlyAdmin;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Function to receive Ether. The function is called when msg.data is empty
    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    // You can also add a fallback function if needed
    fallback() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

}