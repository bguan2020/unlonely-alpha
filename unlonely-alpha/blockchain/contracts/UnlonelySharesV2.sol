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


contract UnlonelySharesV2 is Ownable {
    // EventByte is a unique identifier for each event that takes in:
    // eventAddress: this is the address of the event owner, so channel owner (previously was sharesSubject)
    // eventId: this is numerical and unique ID on our backend to differentiate between events for one channel
    // eventType: this is the type of event, which can be YayVote, NayVote, or VIPBadge
    // and combines all three into one bytes32 key
    type EventByte is bytes32;

    enum EventType {
        YayVote,
        NayVote,
        VIPBadge
    }

    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public subjectFeePercent;

    // ~~~~~~~~~~~~~~~~~~~TODO: edit events to include all types of trades~~~~~~~~~~~~~~~~~~
    event Trade(address trader, EventByte eventByte, bool isBuy, bool isYay, uint256 shareAmount, uint256 ethAmount, uint256 protocolEthAmount, uint256 subjectEthAmount, uint256 supply);
    event EventVerified(EventByte eventByte, bool result);
    event Payout(address indexed voter, uint256 amount);

    // this is a mapping between events and their holders which each own an amount of yay/nay votes
    mapping(EventByte => mapping(address => uint256)) public yayVotesBalance;
    mapping(EventByte => mapping(address => uint256)) public nayVotesBalance;

    mapping(EventByte => uint256) public yayVotesSupply;
    mapping(EventByte => uint256) public nayVotesSupply;

    // this is a mapping between channels and VIP badges
    mapping(EventByte => uint256) public vipBadgeSupply;
    mapping(EventByte => mapping(address => uint256)) public vipBadgeBalance;

    mapping(EventByte => bool) public eventVerified;
    mapping(EventByte => bool) public eventResult;

    // this is a mapping between sharesSubject and total amount of ETH in the pool
    mapping(EventByte => uint256) public pooledEth;

    mapping(address => bool) public isVerifier;


    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Caller is not a verifier");
        _;
    }

    modifier validEventType(EventType eventType) {
        require(
            eventType == EventType.YayVote ||
            eventType == EventType.NayVote ||
            eventType == EventType.VIPBadge,
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

    function addVerifier(address verifier) public onlyOwner {
        isVerifier[verifier] = true;
    }

    function removeVerifier(address verifier) public onlyOwner {
        isVerifier[verifier] = false;
    }

	function generateKey(address eventAddress, uint256 eventId, EventType eventType) public pure validEventType(eventType) returns (EventByte) {
        require(eventId < 1000000, "ID must be less than 1 million");
        return EventByte.wrap(keccak256(abi.encodePacked(eventAddress, eventId, eventType)));
    }

    function verifyEvent(address eventAddress, uint256 eventId, EventType eventType, bool result) public onlyVerifier validEventType(eventType) {
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        require(!eventVerified[eventBytes], "Event already verified");
        eventVerified[eventBytes] = true;
        eventResult[eventBytes] = result;

        emit EventVerified(eventBytes, result);
    }

    function getHolderBalance(address eventAddress, uint256 eventId, EventType eventType, address holder) public view validEventType(eventType) returns (uint256) {
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        if (eventType == EventType.YayVote) {
            return yayVotesBalance[eventBytes][holder];
        } else if (eventType == EventType.NayVote) {
            return nayVotesBalance[eventBytes][holder];
        } else if (eventType == EventType.VIPBadge) {
            return vipBadgeBalance[eventBytes][holder];
        }
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        if (supply == 0 && amount == 0) return 0;
        
        uint256 sum1 = supply == 0 ? 0 : (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
        uint256 sum2 = (supply == 0 && amount == 1) ? 0 : (amount + supply - 1) * (supply + amount) * (2 * (amount + supply - 1) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 32000;
    }

    function getBuyPrice(address eventAddress, uint256 eventId, EventType eventType, uint256 amount) public view validEventType(eventType) returns (uint256) {
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        if (eventType == EventType.YayVote) {
            uint256 supply = yayVotesSupply[eventBytes];
            return getPrice(supply, amount);
        } else if (eventType == EventType.NayVote) {
            uint256 supply = nayVotesSupply[eventBytes];
            return getPrice(supply, amount);
        } else if (eventType == EventType.VIPBadge) {
            uint256 supply = vipBadgeSupply[eventBytes];
            return getPrice(supply, amount);
        }
    }

    function getSellPrice(address eventAddress, uint256 eventId, EventType eventType, uint256 amount) public view validEventType(eventType) returns (uint256) {
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        if (eventType == EventType.YayVote) {
            uint256 supply = yayVotesSupply[eventBytes];
            if (supply < amount) return 0;
            return getPrice(supply - amount, amount);
        } else if (eventType == EventType.NayVote) {
            uint256 supply = nayVotesSupply[eventBytes];
            if (supply < amount) return 0;
            return getPrice(supply - amount, amount);
        } else if (eventType == EventType.VIPBadge) {
            uint256 supply = vipBadgeSupply[eventBytes];
            if (supply < amount) return 0;
            return getPrice(supply - amount, amount);
        }
    }

    function getBuyPriceAfterFee(address eventAddress, uint256 eventId, EventType eventType, uint256 amount) public view validEventType(eventType) returns (uint256) {
        uint256 price = getBuyPrice(eventAddress, eventId, eventType, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        return price + protocolFee + subjectFee;
    }

    function getSellPriceAfterFee(address eventAddress, uint256 eventId, EventType eventType, uint256 amount) public view validEventType(eventType) returns (uint256) {
        uint256 price = getSellPrice(eventAddress, eventId, eventType, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        return price - protocolFee - subjectFee;
    }

    // def: buyShares takes in streamer address (ex: 0xTed), amount of shares purchased, and if its yay or nay
    function buyVotes(address eventAddress, uint256 eventId, EventType eventType, uint256 amount) public payable validEventType(eventType) {
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(!eventVerified[eventBytes], "Event already verified");
        require(amount > 0, "Cannot buy zero shares");
        bool isYay = eventType == EventType.YayVote;
        uint256 supply = isYay ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        uint256 price = getPrice(supply, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        require(msg.value >= price + protocolFee + subjectFee, "Insufficient payment");
        
        // Add the sent ETH (minus fees) to the sharesSubject's pool
        uint256 netEthCost = msg.value - protocolFee - subjectFee;
        pooledEth[eventBytes] += netEthCost;

        if (isYay) {
            yayVotesBalance[eventBytes][msg.sender] += amount;
            yayVotesSupply[eventBytes] += amount;
        } else {
            nayVotesBalance[eventBytes][msg.sender] += amount;
            nayVotesSupply[eventBytes] += amount;
        }

        emit Trade(msg.sender, eventBytes, true, isYay, amount, price, protocolFee, subjectFee, supply + amount);
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = eventAddress.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");
    }

    function sellVotes(address eventAddress, uint256 eventId, EventType eventType, uint256 amount) public payable validEventType(eventType) {
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(!eventVerified[eventBytes], "Event already verified");
        require(amount > 0, "Cannot sell zero shares");
        bool isYay = eventType == EventType.YayVote;
        uint256 supply = isYay ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        require(supply >= amount, "Cannot sell more shares than the current supply");
        
        uint256 userVotes = isYay ? yayVotesBalance[eventBytes][msg.sender] : nayVotesBalance[eventBytes][msg.sender];
        require(userVotes >= amount, "You don't have enough shares to sell");

        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 netAmount = price - protocolFee - subjectFee;

        // Deduct the sold shares from the user's balance and reduce the total supply
        if (isYay) {
            yayVotesBalance[eventBytes][msg.sender] -= amount;
            yayVotesSupply[eventBytes] -= amount;
        } else {
            nayVotesBalance[eventBytes][msg.sender] -= amount;
            nayVotesSupply[eventBytes] -= amount;
        }

        // Deduct the corresponding ETH from the sharesSubject's pool
        pooledEth[eventBytes] -= price;

        uint256 newSupply = supply - amount;
        emit Trade(msg.sender, eventBytes, false, isYay, amount, price, protocolFee, subjectFee, newSupply);
        
        // Transfer the net amount to the seller, and fees to the protocol and subject
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = eventAddress.call{value: subjectFee}("");
        (bool success3, ) = msg.sender.call{value: netAmount}("");
        require(success1 && success2 && success3, "Unable to send funds");
    }


    function claimPayout(address eventAddress, uint256 eventId, EventType eventType) public validEventType(eventType) {
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        require(eventVerified[eventBytes], "Event not yet verified");

        bool result = eventResult[eventBytes];
        uint256 userShares = result ? yayVotesBalance[eventBytes][msg.sender] : nayVotesBalance[eventBytes][msg.sender];

        require(userShares > 0, "No shares to claim for");

        uint256 totalPool = pooledEth[eventBytes];
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
        pooledEth[eventBytes] -= userPayout;

        emit Payout(msg.sender, userPayout);
        (bool success, ) = msg.sender.call{value: userPayout}("");
        require(success, "Unable to send funds");
    }

    // TODO: buy/sell badges, getVIPBadgePrice, claimVIPBadgePayout, changeBondingCurve, maybe isPaused, reentry

    function getPayout(address eventAddress, uint256 eventId, EventType eventType, address userAddress) public view validEventType(eventType) returns (uint256) {
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        if (!eventVerified[eventBytes]) return 0;
        bool result = eventResult[eventBytes];
        uint256 userVotes = result ? yayVotesBalance[eventBytes][userAddress] : nayVotesBalance[eventBytes][userAddress];
        uint256 totalPool = pooledEth[eventBytes];
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
        EventByte eventBytes = generateKey(eventAddress, eventId, eventType);
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(eventVerified[eventBytes], "Event is not verified");
        require(pooledEth[eventBytes] > 0, "Pool is already empty");
        uint256 sharesSupply = eventResult[eventBytes] ? yayVotesSupply[eventBytes] : nayVotesSupply[eventBytes];
        require(sharesSupply == 0, "There are still shares");
        uint256 splitPoolValue = pooledEth[eventBytes] / 2;
        pooledEth[eventBytes] = 0;
        (bool success1, ) = protocolFeeDestination.call{value: splitPoolValue}("");
        (bool success2, ) = eventAddress.call{value: splitPoolValue}("");
        require(success1 && success2, "Unable to send funds");
    }
}