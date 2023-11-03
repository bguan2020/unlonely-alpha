// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

pragma solidity ^0.8.8;

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

contract UnlonelySharesV2 is Ownable, ReentrancyGuard {
    // bytes32 is a unique identifier for each event that takes in:
    // eventAddress: this is the address of the event owner, so channel owner (previously was sharesSubject)
    // eventId: this is numerical and unique ID on our backend to differentiate between events for one channel
    // eventType: this is the type of event, which can be YayVote, NayVote, or VIPBadge
    // and combines all three into one bytes32 key

    enum EventType {
        YayNayVote,
        VIPBadge
    }

    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public subjectFeePercent;

    struct TradeInfo {
        address trader;
        bytes32 eventByte;
        bool isBuy;
        bool isYay;
        uint256 shareAmount;
        uint256 ethAmount;
        uint256 protocolEthAmount;
        uint256 subjectEthAmount;
        uint256 supply;
    }

    // ~~~~~~~~~~~~~~~~~~~TODO: edit events to include all types of trades~~~~~~~~~~~~~~~~~~
    event Trade(TradeInfo trade);
    event EventOpened(bytes32 eventByte, uint256 endTimestamp);
    event EventVerified(bytes32 eventByte, bool result);
    event Payout(address indexed voter, uint256 amount);

    // this is a mapping between events and their holders which each own an amount of yay/nay votes
    mapping(bytes32 => mapping(address => uint256)) public yayVotesBalance;
    mapping(bytes32 => mapping(address => uint256)) public nayVotesBalance;

    mapping(bytes32 => uint256) public yayVotesSupply;
    mapping(bytes32 => uint256) public nayVotesSupply;

    mapping(bytes32 => bool) public eventVerified;
    mapping(bytes32 => bool) public eventResult;
    mapping(bytes32 => uint256) public eventEndTimestamp;

    // this is a mapping between sharesSubject and total amount of ETH in the pool
    mapping(bytes32 => uint256) public votingPooledEth;

    // user roles
    mapping(address => bool) public isVerifier;

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Caller is not a verifier");
        _;
    }

    modifier validEventType(EventType eventType) {
        require(
            eventType == EventType.YayNayVote,
            "Invalid event type"
        );
        _;
    }

    constructor() {
        // Set the contract deployer as the initial verifier
        isVerifier[msg.sender] = true;

        protocolFeePercent = 5 * 10**16; // 5%
        subjectFeePercent = 5 * 10**16;  // 5%
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

    function setVerifier(address verifier, bool value) public onlyOwner {
        isVerifier[verifier] = value;
    }

	function generateKey(address eventAddress, uint256 eventId, EventType eventType) public pure validEventType(eventType) returns (bytes32) {
        require(eventId < 1000000, "ID must be less than 1 million");
        return keccak256(abi.encodePacked(eventAddress, eventId, eventType));
    }

    function openEvent(address eventAddress, uint256 eventId, EventType eventType, uint256 _eventEndTimestamp) public onlyVerifier validEventType(eventType) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        require(!eventVerified[eventBytes], "Event already verified");
        require(eventEndTimestamp[eventBytes] == 0, "Event already opened");
        require(_eventEndTimestamp > block.timestamp, "Event end timestamp must be in the future");
        eventEndTimestamp[eventBytes] = _eventEndTimestamp;

        emit EventOpened(eventBytes, _eventEndTimestamp);
    }

    function verifyEvent(address eventAddress, uint256 eventId, EventType eventType, bool result) public onlyVerifier validEventType(eventType) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        require(!eventVerified[eventBytes], "Event already verified");
        eventVerified[eventBytes] = true;
        eventResult[eventBytes] = result;

        emit EventVerified(eventBytes, result);
    }

    function getHolderBalance(address eventAddress, uint256 eventId, EventType eventType, bool isYay, address holder) public view validEventType(eventType) returns (uint256 balance) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        return isYay ? yayVotesBalance[eventBytes][holder] : nayVotesBalance[eventBytes][holder];
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        if (supply == 0 && amount == 0) return 0;

        uint256 sum1 = supply == 0 ? 0 : (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
        uint256 sum2 = (supply == 0 && amount == 1) ? 0 : (amount + supply - 1) * (supply + amount) * (2 * (amount + supply - 1) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 32000;
    }

    function getBuyPrice(address eventAddress, uint256 eventId, EventType eventType, bool isYay, uint256 amount) public view validEventType(eventType) returns (uint256 price) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        uint256 supply = isYay ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        return getPrice(supply, amount);
    }

    function getSellPrice(address eventAddress, uint256 eventId, EventType eventType, bool isYay, uint256 amount) public view validEventType(eventType) returns (uint256 price) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        uint256 supply = isYay ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        if (supply < amount) return 0;
        return getPrice(supply - amount, amount);
    }

    function getBuyPriceAfterFee(address eventAddress, uint256 eventId, EventType eventType, bool isYay, uint256 amount) public view validEventType(eventType) returns (uint256) {
        uint256 price = getBuyPrice(eventAddress, eventId, eventType, isYay, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        return price + protocolFee + subjectFee;
    }

    function getSellPriceAfterFee(address eventAddress, uint256 eventId, EventType eventType, bool isYay, uint256 amount) public view validEventType(eventType) returns (uint256) {
        uint256 price = getSellPrice(eventAddress, eventId, eventType, isYay, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        return price - protocolFee - subjectFee;
    }

    // def: buyShares takes in streamer address (ex: 0xTed), amount of shares purchased, and if its yay or nay
    function buyVotes(address eventAddress, uint256 eventId, EventType eventType, bool isYay, uint256 amount) public payable validEventType(eventType) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        require(eventEndTimestamp[eventBytes] > 0 && eventEndTimestamp[eventBytes] > block.timestamp, "Event is not ongoing");
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(!eventVerified[eventBytes], "Event already verified");
        require(amount > 0, "Cannot buy zero shares");
        uint256 supply = isYay ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        uint256 price = getPrice(supply, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        require(msg.value >= price + protocolFee + subjectFee, "Insufficient payment");

        // Add the sent ETH (minus fees) to the sharesSubject's pool
        votingPooledEth[eventBytes] += (msg.value - protocolFee - subjectFee);

        if (isYay) {
            yayVotesBalance[eventBytes][msg.sender] += amount;
            yayVotesSupply[eventBytes] += amount;
        } else {
            nayVotesBalance[eventBytes][msg.sender] += amount;
            nayVotesSupply[eventBytes] += amount;
        }

        TradeInfo memory tradeInfo = TradeInfo({
            trader: msg.sender,
            eventByte: eventBytes,
            isBuy: true,
            isYay: isYay,
            shareAmount: amount,
            ethAmount: price,
            protocolEthAmount: protocolFee,
            subjectEthAmount: subjectFee,
            supply: supply + amount
        });

        emit Trade(tradeInfo);
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = eventAddress.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");
    }

    function sellVotes(address eventAddress, uint256 eventId, EventType eventType, bool isYay, uint256 amount) public payable validEventType(eventType) nonReentrant {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        require(eventEndTimestamp[eventBytes] > 0 && eventEndTimestamp[eventBytes] > block.timestamp, "Event is not ongoing");
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(!eventVerified[eventBytes], "Event already verified");
        require(amount > 0, "Cannot sell zero shares");
        uint256 supply = isYay ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        require(supply >= amount, "Cannot sell more shares than the current supply");

        uint256 userVotes = isYay ? yayVotesBalance[eventBytes][msg.sender] : nayVotesBalance[eventBytes][msg.sender];
        require(userVotes >= amount, "You don't have enough shares to sell");
        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        // Deduct the sold shares from the user's balance and reduce the total supply
        if (isYay) {
            yayVotesBalance[eventBytes][msg.sender] -= amount;
            yayVotesSupply[eventBytes] -= amount;
        } else {
            nayVotesBalance[eventBytes][msg.sender] -= amount;
            nayVotesSupply[eventBytes] -= amount;
        }

        // Deduct the corresponding ETH from the sharesSubject's pool
        votingPooledEth[eventBytes] -= price;

        uint256 newSupply = supply - amount;

        TradeInfo memory tradeInfo = TradeInfo({
            trader: msg.sender,
            eventByte: eventBytes,
            isBuy: false,
            isYay: isYay,
            shareAmount: amount,
            ethAmount: price,
            protocolEthAmount: protocolFee,
            subjectEthAmount: subjectFee,
            supply: newSupply
        });

        emit Trade(tradeInfo);

        // Transfer the net amount to the seller, and fees to the protocol and subject
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = eventAddress.call{value: subjectFee}("");
        (bool success3, ) = msg.sender.call{value: price - protocolFee - subjectFee}("");
        require(success1 && success2 && success3, "Unable to send funds");
    }


    function claimVotePayout(address eventAddress, uint256 eventId, EventType eventType) public validEventType(eventType) nonReentrant {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        require(eventVerified[eventBytes], "Event not yet verified");

        bool result = eventResult[eventBytes];
        uint256 userShares = result ? yayVotesBalance[eventBytes][msg.sender] : nayVotesBalance[eventBytes][msg.sender];

        require(userShares > 0, "No shares to claim for");

        uint256 totalPool = votingPooledEth[eventBytes];
        uint256 totalWinningShares = result ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        uint256 userPayout = totalWinningShares == 0 ? 0 : (totalPool * userShares / totalWinningShares);

        require(userPayout > 0, "No payout for user");


        // Reset user's shares after distributing
        if (result) {
            yayVotesBalance[eventBytes][msg.sender] = 0;
            yayVotesSupply[eventBytes] -= userShares;
        } else {
            nayVotesBalance[eventBytes][msg.sender] = 0;
            nayVotesSupply[eventBytes] -= userShares;
        }

        // Deduct the user's payout from the sharesSubject's pool
        votingPooledEth[eventBytes] -= userPayout;

        emit Payout(msg.sender, userPayout);
        (bool success, ) = msg.sender.call{value: userPayout}("");
        require(success, "Unable to send funds");
    }

    function getVotePayout(address eventAddress, uint256 eventId, EventType eventType, address userAddress) public view validEventType(eventType) returns (uint256) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        if (!eventVerified[eventBytes]) return 0;
        bool result = eventResult[eventBytes];
        uint256 userVotes = result ? yayVotesBalance[eventBytes][userAddress] : nayVotesBalance[eventBytes][userAddress];
        uint256 totalPool = votingPooledEth[eventBytes];
        uint256 totalWinningShares = result ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        uint256 userPayout = totalWinningShares == 0 ? 0 : (totalPool * userVotes / totalWinningShares);
        return userPayout;
    }

    /*
        this is for the unlikely edge-case that there are no winners 
        if yay wins but everyone is holding nay shares and no one is holding yay shares, 
        split the pool w creator and protocol
    */
    function closeEventIfNoWinners(address eventAddress, uint256 eventId, EventType eventType) public onlyVerifier validEventType(eventType) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(eventVerified[eventBytes], "Event is not verified");
        require(votingPooledEth[eventBytes] > 0, "Pool is already empty");
        uint256 sharesSupply = eventResult[eventBytes] ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        require(sharesSupply == 0, "There are still shares");
        uint256 splitPoolValue = votingPooledEth[eventBytes] / 2;
        votingPooledEth[eventBytes] = 0;
        (bool success1, ) = protocolFeeDestination.call{value: splitPoolValue}("");
        (bool success2, ) = eventAddress.call{value: splitPoolValue}("");
        require(success1 && success2, "Unable to send funds");
    }
}