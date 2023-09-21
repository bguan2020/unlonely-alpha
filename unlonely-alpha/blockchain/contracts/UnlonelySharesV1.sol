// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


contract UnlonelySharesV1 is Ownable {
    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public subjectFeePercent;
    bool public isPaused;

    event Trade(address trader, address subject, bool isBuy, bool isYay, uint256 shareAmount, uint256 ethAmount, uint256 protocolEthAmount, uint256 subjectEthAmount, uint256 supply);
    event EventVerified(address indexed sharesSubject, bool result);
    event Payout(address indexed voter, uint256 amount);

    // this is a mapping between sharesSubject and their holders which each own an amount of yay/nay shares
    mapping(address => mapping(address => uint256)) public yaySharesBalance;
    mapping(address => mapping(address => uint256)) public naySharesBalance;

    // this is a mapping between sharesSubject and how many shares have been purchased
    mapping(address => uint256) public yaySharesSupply;
    mapping(address => uint256) public naySharesSupply;

    mapping(address => bool) public eventVerified;
    mapping(address => bool) public eventResult;
    mapping(address => bool) public isVerifier;

    // this is a mapping between sharesSubject and total amount of ETH in the pool
    mapping(address => uint256) public pooledEth;

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Caller is not a verifier");
        _;
    }

    constructor() {
        // Set the contract deployer as the initial verifier
        isVerifier[msg.sender] = true;

        protocolFeePercent = 5 * 10**16; // 5%
        subjectFeePercent = 5 * 10**16;  // 5%
    }

    function addVerifier(address verifier) public onlyOwner {
        isVerifier[verifier] = true;
    }

    function removeVerifier(address verifier) public onlyOwner {
        isVerifier[verifier] = false;
    }

    function verifyEvent(address sharesSubject, bool result) public onlyVerifier {
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(!eventVerified[sharesSubject], "Event already verified");
        eventVerified[sharesSubject] = true;
        eventResult[sharesSubject] = result;

        emit EventVerified(sharesSubject, result);
    }

    function closeVerifiedPool(address sharesSubject) public onlyVerifier {
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(eventVerified[sharesSubject], "Event is not verified");
        require(pooledEth[sharesSubject] > 0, "Pool is already empty");
        uint256 sharesSupply = eventResult[sharesSubject] ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        require(sharesSupply == 0, "There are still shares");

        uint256 splitPoolValue = pooledEth[sharesSubject] / 2;
        (bool success1, ) = protocolFeeDestination.call{value: splitPoolValue}("");
        (bool success2, ) = sharesSubject.call{value: splitPoolValue}("");
        require(success1 && success2, "Unable to send funds");
    }

    function setFeeDestination(address _feeDestination) public onlyOwner {
        protocolFeeDestination = _feeDestination;
    }

    function setProtocolFeePercent(uint256 _feePercent) public onlyOwner {
        protocolFeePercent = _feePercent;
    }

    function setSubjectFeePercent(uint256 _feePercent) public onlyOwner {
        subjectFeePercent = _feePercent;
    }

    function setIsPaused(bool _isPaused) public onlyOwner {
        isPaused = _isPaused;
    }

    function getHolderSharesBalance(address sharesSubject, address holder, bool isYay) public view returns (uint256) {
        return isYay ? yaySharesBalance[sharesSubject][holder] : naySharesBalance[sharesSubject][holder];
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        if (supply == 0 && amount == 0) return 0;
        
        uint256 sum1 = supply == 0 ? 0 : (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
        uint256 sum2 = (supply == 0 && amount == 1) ? 0 : (amount + supply - 1) * (supply + amount) * (2 * (amount + supply - 1) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 16000;
    }

    function getBuyPrice(address sharesSubject, uint256 amount, bool isYay) public view returns (uint256) {
        uint256 sharesSupply = isYay ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        return getPrice(sharesSupply, amount);
    }

    function getSellPrice(address sharesSubject, uint256 amount, bool isYay) public view returns (uint256) {
        uint256 sharesSupply = isYay ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        if (sharesSupply < amount) return 0;
        return getPrice(sharesSupply - amount, amount);
    }

    function getBuyPriceAfterFee(address sharesSubject, uint256 amount, bool isYay) public view returns (uint256) {
        uint256 price = getBuyPrice(sharesSubject, amount, isYay);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        return price + protocolFee + subjectFee;
    }

    function getSellPriceAfterFee(address sharesSubject, uint256 amount, bool isYay) public view returns (uint256) {
        uint256 price = getSellPrice(sharesSubject, amount, isYay);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        return price - protocolFee - subjectFee;
    }

    function getPayout(address sharesSubject, address user) public view returns (uint256) {
        if (!eventVerified[sharesSubject]) return 0;
        bool result = eventResult[sharesSubject];
        uint256 userShares = result ? yaySharesBalance[sharesSubject][user] : naySharesBalance[sharesSubject][user];
        uint256 totalPool = pooledEth[sharesSubject];
        uint256 totalWinningShares = result ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        uint256 userPayout = totalWinningShares == 0 ? 0 : (totalPool * userShares / totalWinningShares);
        return userPayout;
    }

    // def: buyShares takes in streamer address (ex: 0xTed), amount of shares purchased, and if its yay or nay
    function buyShares(address sharesSubject, uint256 amount, bool isYay) public payable {
        require(!isPaused, "Contract is paused");
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(!eventVerified[sharesSubject], "Event already verified");
        require(amount > 0, "Cannot buy zero shares");
        uint256 supply = isYay ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        uint256 price = getPrice(supply, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        require(msg.value >= price + protocolFee + subjectFee, "Insufficient payment");
        
        // Add the sent ETH (minus fees) to the sharesSubject's pool
        uint256 netEthCost = msg.value - protocolFee - subjectFee;
        pooledEth[sharesSubject] += netEthCost;

        if (isYay) {
            yaySharesBalance[sharesSubject][msg.sender] += amount;
            yaySharesSupply[sharesSubject] += amount;
        } else {
            naySharesBalance[sharesSubject][msg.sender] += amount;
            naySharesSupply[sharesSubject] += amount;
        }

        emit Trade(msg.sender, sharesSubject, true, isYay, amount, price, protocolFee, subjectFee, supply + amount);
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = sharesSubject.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");
    }

    function sellShares(address sharesSubject, uint256 amount, bool isYay) public {
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(!eventVerified[sharesSubject], "Event already verified");
        require(amount > 0, "Cannot sell zero shares");
        uint256 supply = isYay ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        require(supply >= amount, "Cannot sell more shares than the current supply");
        
        uint256 userShares = isYay ? yaySharesBalance[sharesSubject][msg.sender] : naySharesBalance[sharesSubject][msg.sender];
        require(userShares >= amount, "You don't have enough shares to sell");

        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 netAmount = price - protocolFee - subjectFee;

        // Deduct the sold shares from the user's balance and reduce the total supply
        if (isYay) {
            yaySharesBalance[sharesSubject][msg.sender] -= amount;
            yaySharesSupply[sharesSubject] -= amount;
        } else {
            naySharesBalance[sharesSubject][msg.sender] -= amount;
            naySharesSupply[sharesSubject] -= amount;
        }

        // Deduct the corresponding ETH from the sharesSubject's pool
        pooledEth[sharesSubject] -= netAmount;

        uint256 newSupply = supply - amount;
        emit Trade(msg.sender, sharesSubject, false, isYay, amount, price, protocolFee, subjectFee, newSupply);
        
        // Transfer the net amount to the seller, and fees to the protocol and subject
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = sharesSubject.call{value: subjectFee}("");
        (bool success3, ) = msg.sender.call{value: netAmount}("");
        require(success1 && success2 && success3, "Unable to send funds");
    }


    function claimPayout(address sharesSubject) public {
        require(eventVerified[sharesSubject], "Event not yet verified");

        bool result = eventResult[sharesSubject];
        uint256 userShares = result ? yaySharesBalance[sharesSubject][msg.sender] : naySharesBalance[sharesSubject][msg.sender];

        require(userShares > 0, "No shares to claim for");

        uint256 totalPool = pooledEth[sharesSubject];
        uint256 totalWinningShares = result ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        uint256 userPayout = totalWinningShares == 0 ? 0 : (totalPool * userShares / totalWinningShares);

        require(userPayout > 0, "No payout for user");

        
        // Reset user's shares after distributing
        if (result) {
            yaySharesBalance[sharesSubject][msg.sender] = 0;
            yaySharesSupply[sharesSubject] -= userShares;
        } else {
            naySharesBalance[sharesSubject][msg.sender] = 0;
            naySharesSupply[sharesSubject] -= userShares;
        }

        // Deduct the user's payout from the sharesSubject's pool
        pooledEth[sharesSubject] -= userPayout;

        emit Payout(msg.sender, userPayout);
        (bool success, ) = msg.sender.call{value: userPayout}("");
        require(success, "Unable to send funds");
    }
}