// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TempTokenV1 is ERC20, Ownable, ReentrancyGuard {

/**
    * @dev factoryAddress is the address of the factory that deployed this token.
    * @dev protocolFeeDestination is the address where the protocol fees are sent.
    * @dev protocolFeePercent is the percentage of the protocol fee. ex: 2% = 2 * 10**16 = 20000000000000000
    * @dev streamerFeePercent is the percentage of the streamer fee. ex: 2% = 2 * 10**16 = 20000000000000000
    * @dev endTimestamp is the timestamp when the token is no longer tradeable.
    * @dev totalSupplyThreshold is the total supply needed for the token to convert from a TempToken into a normal, permanent token. 
           This total supply will be adjusted by us depending on various factors.
           The goal of each TempToken is to have hit this threshold by the time the duration has expired.
           IT'S A GAME.
    * @dev hasHitTotalSupplyThreshold is a boolean to check if the total supply threshold has been hit.
 */
    address public factoryAddress;
    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public streamerFeePercent;
    uint256 public endTimestamp;
    uint256 public totalSupplyThreshold;
    bool public hasHitTotalSupplyThreshold;

    event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent, uint256 endTimestamp, bool hasHitTotalSupplyThreshold);
    event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent);
    event TokenDurationExtended(uint256 indexed endTimestamp);
    event SendRemainingFundsToCreatorAfterTokenExpiration(address indexed account, uint256 balance);

    error InsufficientValue(uint256 minimumValue, uint256 value);
    error BurnAmountTooHigh(uint256 maximumAmount, uint256 amount);
    error EtherTransferFailed(address to, uint256 value);
    // error ActionNotAllowed();

    /**
        * @dev activePhase modifier checks if the current block timestamp is less than or equal to the endTimestamp. 
        * At a high level, during the active phase of the token, users can mint and burn tokens on a bonding curve.
        * When the active phase ends, users can no longer mint or burn tokens and all remaining funds in the pool can be sent to the token owner.
     */
    modifier activePhase() {
        require(block.timestamp <= endTimestamp, "Active phase has ended");
        _;
    }

    /**
        * @dev endedPhase modifier checks if the current block timestamp is greater than the endTimestamp.
     */
    modifier endedPhase() {
        require(block.timestamp > endTimestamp, "Active phase has not ended");
        _;
    }

   constructor(
        string memory name,
        string memory symbol,
        uint256 _endTimestamp,
        address _protocolFeeDestination,
        uint256 _protocolFeePercent,
        uint256 _streamerFeePercent,
        uint256 _totalSupplyThreshold,
        address _factoryAddress
    ) ERC20(name, symbol) {
        require(_protocolFeeDestination != address(0), "Fee destination cannot be the zero address");
        
        endTimestamp = _endTimestamp;
        protocolFeePercent = _protocolFeePercent;
        streamerFeePercent = _streamerFeePercent;
        protocolFeeDestination = _protocolFeeDestination;
        totalSupplyThreshold = _totalSupplyThreshold;
        factoryAddress = _factoryAddress;
        hasHitTotalSupplyThreshold = false;
    }

    /**
        * @dev mint function allows users to mint tokens on the bonding curve. 
        * @param _amount is the amount of tokens to mint.
        * If total supply threshold gets hit, extend the tokens lifespan by 25 hours.
     */
    function mint(uint256 _amount) external payable activePhase {
        uint256 cost = mintCost(_amount);
        uint256 protocolFee = cost * protocolFeePercent / 1 ether;
        uint256 subjectFee = cost * streamerFeePercent / 1 ether;
        uint256 totalCost = cost + protocolFee + subjectFee;

        if (msg.value < totalCost) {
            revert InsufficientValue(totalCost, msg.value);
        }

        _mint(msg.sender, _amount);

        // Check if total supply has hit the threshold for the first time
        if(totalSupply() >= totalSupplyThreshold && !hasHitTotalSupplyThreshold) {
            endTimestamp += 25 hours;
            hasHitTotalSupplyThreshold = true; // Ensure this logic runs only once
            emit TokenDurationExtended(endTimestamp);
        }

        if(msg.value > totalCost) {
            (bool sent,) = msg.sender.call{value: msg.value - totalCost}("");
            if (!sent) {
                revert EtherTransferFailed(msg.sender, msg.value - totalCost);
            }
        }

        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = owner().call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");

        emit Mint(msg.sender, _amount, owner(), totalSupply(), protocolFeePercent, streamerFeePercent, endTimestamp, hasHitTotalSupplyThreshold);
    }

    /**
        * @dev burn function allows users to burn tokens on the bonding curve.
        * @param _amount is the amount of tokens to burn.
     */
    function burn(uint256 _amount) external activePhase {
        if (_amount > balanceOf(msg.sender)) {
            revert BurnAmountTooHigh(balanceOf(msg.sender), _amount);
        }

        // Calculate refund before burn, to use the totalSupply before the burn
        uint256 proceeds = burnProceeds(_amount);
        uint256 protocolFee = proceeds * protocolFeePercent / 1 ether;
        uint256 subjectFee = proceeds * streamerFeePercent / 1 ether;

        _burn(msg.sender, _amount);

        (bool sent,) = msg.sender.call{value: proceeds - protocolFee - subjectFee}("");
        if (!sent) {
            revert EtherTransferFailed(msg.sender, proceeds - protocolFee - subjectFee);
        }

        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = owner().call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");

        emit Burn(msg.sender, _amount, owner(), totalSupply(), protocolFeePercent, streamerFeePercent);
    }

    /**
        * @dev sendRemainingFundsToCreatorAfterTokenExpiration function allows the token owner to send all remaining funds in the pool to the token owner.
        * This function can only be called after the endTimestamp has passed.
        * The purpose of this function is incentivize people to sell prior to the token expiring, creating a short term token market to match the duration of the livestream. 
        * If you don't sell in time, consider it a donation to the streamer/creator. 
        * All TempTokens on the Unlonely frontend will have extremely clear countdowns and disclaimers telling you that this token will expire.
     */
    function sendRemainingFundsToCreatorAfterTokenExpiration() external onlyOwner endedPhase nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available to send");

        uint256 protocolFee = balance * protocolFeePercent / 1 ether;

        (bool success1, ) = owner().call{value: balance - protocolFee}("");
        (bool success2, ) = protocolFeeDestination.call{value: protocolFee}("");
        require(success1 && success2, "Failed to transfer funds");

        emit SendRemainingFundsToCreatorAfterTokenExpiration(msg.sender, balance);
    }

    /** 
        * @dev updateTotalSupplyThreshold function updates the total supply threshold.
        * @param _newThreshold is the new total supply threshold.
        * it is only callable by the factory contract.
    */
    function updateTotalSupplyThreshold(uint256 _newThreshold) public {
        require(msg.sender == factoryAddress, "Only the factory can update the threshold");
        if (_newThreshold > totalSupplyThreshold) {
            hasHitTotalSupplyThreshold = false;
        }
        totalSupplyThreshold = _newThreshold;
    }

    /**
        * @dev increaseEndTimestamp function allows the token owner to increase the endTimestamp by a specified duration.
        * @param _additionalDurationInSeconds is the duration to increase the endTimestamp by.
        * This function is only callable by the factory contract.
     */

    function increaseEndTimestamp(uint256 _additionalDurationInSeconds) public {
        require(msg.sender == factoryAddress, "Only the factory can increase the end timestamp");
        endTimestamp += _additionalDurationInSeconds;
        emit TokenDurationExtended(endTimestamp);
    }

    function mintCost(uint256 _amount) public view returns (uint256) {
        // The sum of the prices of all tokens already minted
        uint256 sumPricesCurrentTotalSupply = sumOfPriceToNTokens(totalSupply());
        // The sum of the prices of all the tokens already minted + the tokens to be newly minted
        uint256 sumPricesNewTotalSupply = sumOfPriceToNTokens(totalSupply() + _amount);

        return sumPricesNewTotalSupply - sumPricesCurrentTotalSupply;
    }
    
    function mintCostAfterFees(uint256 _amount) public view returns (uint256) {
        // The sum of the prices of all tokens already minted
        uint256 sumPricesCurrentTotalSupply = sumOfPriceToNTokens(totalSupply());
        // The sum of the prices of all the tokens already minted + the tokens to be newly minted
        uint256 sumPricesNewTotalSupply = sumOfPriceToNTokens(totalSupply() + _amount);
        uint256 sumDiff = sumPricesNewTotalSupply - sumPricesCurrentTotalSupply;

        uint256 protocolFee = sumDiff * protocolFeePercent / 1 ether;
        uint256 subjectFee = sumDiff * streamerFeePercent / 1 ether;
        uint256 totalCost = sumDiff + protocolFee + subjectFee;

        return totalCost;
    }

    function burnProceeds(uint256 _amount) public view returns (uint256) {
        // The sum of the prices of all the tokens already minted
        uint256 sumBeforeBurn = sumOfPriceToNTokens(totalSupply());
        // The sum of the prices of all the tokens after burning _amount
        uint256 sumAfterBurn = sumOfPriceToNTokens(totalSupply() - _amount);

        return sumBeforeBurn - sumAfterBurn;
    }

    function burnProceedsAfterFees(uint256 _amount) public view returns (uint256) {
        if (_amount > totalSupply()) {
            // If the amount to burn exceeds total supply, return 0 or some error value
            return 0;
        }

        uint256 sumBeforeBurn = sumOfPriceToNTokens(totalSupply());
        uint256 sumAfterBurn = sumOfPriceToNTokens(totalSupply() - _amount);

        uint256 sumDiff = sumBeforeBurn - sumAfterBurn;

        uint256 protocolFee = sumDiff * protocolFeePercent / 1 ether;
        uint256 subjectFee = sumDiff * streamerFeePercent / 1 ether;

        // Check if sumDiff is less than the total fees
        if (sumDiff < protocolFee + subjectFee) {
            // Handle the scenario, such as returning 0 or a specific error value
            return 0;
        }

        uint256 proceeds = sumDiff - protocolFee - subjectFee;
        return proceeds;
    }

    function decimals() pure public override returns (uint8) {
        return 0;
    }

    function getIsActive() public view returns (bool) {
        return block.timestamp < endTimestamp;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // The price of *all* tokens from number 1 to n.
    function sumOfPriceToNTokens(uint256 n_) pure public returns (uint256) {
        return n_ * (n_ + 1) * (2 * n_ + 1) / 6;
    }
}
