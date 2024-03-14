// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EphemeralVibesTokenV1 is ERC20, Ownable, ReentrancyGuard {
    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public streamerFeePercent;
    uint256 public MAX_SUPPLY = 20_000_000;
    uint256 public endTimestamp;

    event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent);
    event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent);
    event Drain(address indexed account, uint256 balance);

    error InsufficientValue(uint256 minimumValue, uint256 value);
    error BurnAmountTooHigh(uint256 maximumAmount, uint256 amount);
    error EtherTransferFailed(address to, uint256 value);
    error ActionNotAllowed();

    modifier activePhase() {
        require(block.timestamp < endTimestamp, "Active phase has ended");
        _;
    }

    modifier endedPhase() {
        require(block.timestamp >= endTimestamp, "Contract is still in active phase");
        _;
    }

   constructor(
        string memory name,
        string memory symbol,
        uint256 _endTimestamp,
        address _protocolFeeDestination,
        uint256 _protocolFeePercent,
        uint256 _streamerFeePercent
    ) ERC20(name, symbol) {
        require(_protocolFeeDestination != address(0), "Fee destination cannot be the zero address");
        
        endTimestamp = _endTimestamp;
        protocolFeePercent = _protocolFeePercent;
        streamerFeePercent = _streamerFeePercent;
        protocolFeeDestination = _protocolFeeDestination;
    }

     function mint(uint256 _amount) external payable activePhase {
        require(totalSupply() + _amount <= MAX_SUPPLY, "Maximum supply exceeded");
        uint256 cost = mintCost(_amount);
        uint256 protocolFee = cost * protocolFeePercent / 1 ether;
        uint256 subjectFee = cost * streamerFeePercent / 1 ether;
        uint256 totalCost = cost + protocolFee + subjectFee;

        if (msg.value < totalCost) {
            revert InsufficientValue(totalCost, msg.value);
        }

        _mint(msg.sender, _amount);

        if(msg.value > totalCost) {
            (bool sent,) = msg.sender.call{value: msg.value - totalCost}("");
            if (!sent) {
                revert EtherTransferFailed(msg.sender, msg.value - totalCost);
            }
        }

        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = owner().call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");

        emit Mint(msg.sender, _amount, owner(), totalSupply(), protocolFeePercent, streamerFeePercent);
    }

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

    function drainFundsIntoMyWallet() external onlyOwner endedPhase nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available to drain");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed to transfer funds");

        emit Drain(msg.sender, balance);
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

    // The price of *all* tokens from number 1 to n.
    function sumOfPriceToNTokens(uint256 n_) pure public returns (uint256) {
        return n_ * (n_ + 1) * (2 * n_ + 1) / 6;
    }
}
