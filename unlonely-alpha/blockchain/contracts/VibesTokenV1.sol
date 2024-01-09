// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VibesTokenV1 is ERC20, Ownable {
    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public streamerFeePercent;
    uint256 public MAX_SUPPLY = 20_000_000;

    event Mint(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply);
    event Burn(address indexed account, uint256 amount, address indexed streamerAddress, uint256 indexed totalSupply);

    error InsufficientValue(uint256 minimumValue, uint256 value);
    error BurnAmountTooHigh(uint256 maximumAmount, uint256 amount);
    error EtherTransferFailed(address to, uint256 value);

    modifier requireFeeDestination() {
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        _;
    }
    
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        protocolFeePercent = 2 * 10**16; // 2%
        streamerFeePercent = 2 * 10**16;  // 2%
    }

    function setFeeDestination(address _feeDestination) public onlyOwner {
        protocolFeeDestination = _feeDestination;
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwner {
        protocolFeePercent = _feePercent;
    }

    function setStreamerFeePercent(uint256 _feePercent) public onlyOwner {
        streamerFeePercent = _feePercent;
    }

    function mint(uint256 _amount, address _streamerAddress) external payable requireFeeDestination {
        require(_streamerAddress != address(0), "_streamerAddress is a zero address");
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
        (bool success2, ) = _streamerAddress.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");

        emit Mint(msg.sender, _amount, _streamerAddress, totalSupply());
    }

    function burn(uint256 _amount, address _streamerAddress) external requireFeeDestination {
        require(_streamerAddress != address(0), "_streamerAddress is a zero address");
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
        (bool success2, ) = _streamerAddress.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");

        emit Burn(msg.sender, _amount, _streamerAddress, totalSupply());
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

    // The price of *all* tokens from number 1 to n.
    function sumOfPriceToNTokens(uint256 n_) pure public returns (uint256) {
        return n_ * (n_ + 1) * (2 * n_ + 1) / 6;
    }
}