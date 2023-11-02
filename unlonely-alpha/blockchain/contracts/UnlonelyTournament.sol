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

contract UnlonelyTournament is Ownable, ReentrancyGuard {
    // Tournament is a struct that holds the state of a tournament, eventByte key pointing to the winning VIPBadge as well as the vip pooled ETH. Only one tournament is allowed at a time. This is intentional.
    
    enum EventType {
        YayNayVote,
        VIPBadge
    }

    struct Tournament {
        bool isActive;
        bool isWinnerSelected;
        bytes32 winningBadge;
        uint256 vipPooledEth;
        uint256 endTimestamp;
    }

    Tournament public activeTournament;

    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public subjectFeePercent;
    uint256 public tournamentFeePercent;

    event Payout(address indexed voter, uint256 amount);

    mapping(bytes32 => uint256) public vipBadgeSupply;
    mapping(bytes32 => mapping(address => uint256)) public vipBadgeBalance;
    mapping(address => bool) public isTournamentCreator;

    modifier onlyTournamentCreator() {
        require(isTournamentCreator[msg.sender], "Caller is not a tournament creator");
        _;
    }

    modifier validEventType(EventType eventType) {
        require(
            eventType == EventType.VIPBadge,
            "Invalid event type"
        );
        _;
    }

    constructor() {
        // Set the contract deployer as the initial tournament creator

        isTournamentCreator[msg.sender] = true;
        protocolFeePercent = 5 * 10**16; // 5%
        subjectFeePercent = 5 * 10**16;  // 5%
        tournamentFeePercent = 5 * 10**16;  // 5%
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

    function setTournamentFeePercent(uint256 _feePercent) public onlyOwner {
        tournamentFeePercent = _feePercent;
    }

    function setTournamentCreator(address creator, bool value) public onlyOwner {
        isTournamentCreator[creator] = value;
    }

	function generateKey(address streamerAddress, uint256 eventId, EventType eventType) public pure validEventType(eventType) returns (bytes32) {
        require(eventId < 1000000, "ID must be less than 1 million");
        return keccak256(abi.encodePacked(streamerAddress, eventId, eventType));
    }

    function createTournament(uint256 endTimestamp) public onlyTournamentCreator {
        require(!activeTournament.isActive, "A tournament is already active.");
        activeTournament = Tournament({
            isActive: true,
            isWinnerSelected: false,
            winningBadge: bytes32(0),
            vipPooledEth: 0,
            endTimestamp: endTimestamp
        });
    }

    function selectTournamentWinner(address streamerAddress, uint256 eventId, EventType eventType) public onlyTournamentCreator validEventType(eventType) {
        require(activeTournament.isActive, "No active tournament currently.");
        require(!activeTournament.isWinnerSelected, "Winner already selected.");
        bytes32 winningBadge = generateKey(streamerAddress, eventId, eventType);
        activeTournament.winningBadge = winningBadge;
        activeTournament.isWinnerSelected = true;
    }

    function claimTournamentPayout() public nonReentrant {
        require(activeTournament.isActive, "No active tournament currently.");
        require(activeTournament.isWinnerSelected, "Winner not selected.");
        require(vipBadgeBalance[activeTournament.winningBadge][msg.sender] > 0, "No VIP badges to claim payout for.");
        uint256 totalPool = activeTournament.vipPooledEth;
        uint256 totalWinningShares = vipBadgeSupply[activeTournament.winningBadge];
        uint256 userPayout = totalWinningShares == 0 ? 0 : (totalPool * vipBadgeBalance[activeTournament.winningBadge][msg.sender] / totalWinningShares);
        require(userPayout > 0, "No payout for user");

        // Reset user's shares after distributing
        vipBadgeBalance[activeTournament.winningBadge][msg.sender] = 0;
        vipBadgeSupply[activeTournament.winningBadge] -= vipBadgeBalance[activeTournament.winningBadge][msg.sender];

        // Deduct the user's payout from the sharesSubject's pool
        activeTournament.vipPooledEth -= userPayout;

        emit Payout(msg.sender, userPayout);
        (bool success, ) = msg.sender.call{value: userPayout}("");
        require(success, "Unable to send funds");
    }

    function getTournamentPayout(address _address) public view returns (uint256){
        if (!activeTournament.isWinnerSelected) return 0;
        uint256 totalPool = activeTournament.vipPooledEth;
        uint256 totalWinningShares = vipBadgeSupply[activeTournament.winningBadge];
        uint256 userPayout = totalWinningShares == 0 ? 0 : (totalPool * vipBadgeBalance[activeTournament.winningBadge][_address] / totalWinningShares);
        return userPayout;
    }

    function endTournament() public onlyTournamentCreator {
        require(activeTournament.isActive, "No active tournament currently.");
        activeTournament.isActive = false;
    }

    function getHolderBalance(address streamerAddress, uint256 eventId, EventType eventType, address holder) public view validEventType(eventType) returns (uint256 balance) {
        bytes32 key = generateKey(streamerAddress, eventId, eventType);
        return vipBadgeBalance[key][holder];
    }

    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        if (supply == 0 && amount == 0) return 0;

        uint256 sum1 = supply == 0 ? 0 : (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
        uint256 sum2 = (supply == 0 && amount == 1) ? 0 : (amount + supply - 1) * (supply + amount) * (2 * (amount + supply - 1) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 32000;
    }

    function getBuyPrice(address streamerAddress, uint256 eventId, EventType eventType, uint256 amount) public view validEventType(eventType) returns (uint256 price) {
        bytes32 key = generateKey(streamerAddress, eventId, eventType);
        uint256 supply = vipBadgeSupply[key];
        return getPrice(supply, amount);
    }

    function getSellPrice(address streamerAddress, uint256 eventId, EventType eventType, uint256 amount) public view validEventType(eventType) returns (uint256 price) {
        bytes32 key = generateKey(streamerAddress, eventId, eventType);
        uint256 supply = vipBadgeSupply[key];
        if (supply < amount) return 0;
        return getPrice(supply - amount, amount);
    }

    function getBuyPriceAfterFee(address streamerAddress, uint256 eventId, EventType eventType, uint256 amount) public view validEventType(eventType) returns (uint256) {
        uint256 price = getBuyPrice(streamerAddress, eventId, eventType, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 tournamentFee = price * tournamentFeePercent / 1 ether;
        return price + protocolFee + subjectFee + tournamentFee;
    }

    function getSellPriceAfterFee(address streamerAddress, uint256 eventId, EventType eventType, uint256 amount) public view validEventType(eventType) returns (uint256) {
        uint256 price = getSellPrice(streamerAddress, eventId, eventType, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 tournamentFee = price * tournamentFeePercent / 1 ether;
        return price - protocolFee - subjectFee - tournamentFee;
    }

    function buyVIPBadge(address streamerAddress, uint256 eventId, EventType eventType, uint256 amount) public payable validEventType(eventType) {
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(activeTournament.isActive, "No active tournament currently.");
        require(amount > 0, "Cannot buy zero badges");
        bytes32 key = generateKey(streamerAddress, eventId, eventType);
        uint256 price = getPrice(vipBadgeSupply[key], amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 tournamentFee = price * tournamentFeePercent / 1 ether;  // Assume tournamentFeePercent is defined
        require(msg.value >= price + protocolFee + subjectFee + tournamentFee, "Insufficient payment");

        // Update the contract state
        vipBadgeSupply[key] += amount;
        vipBadgeBalance[key][msg.sender] += amount;
        activeTournament.vipPooledEth += tournamentFee;

        // Send protocol and subject fees
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = streamerAddress.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");
    }

    function sellVIPBadge(address streamerAddress, uint256 eventId, EventType eventType, uint256 amount) public validEventType(eventType) nonReentrant {
        require(protocolFeeDestination != address(0), "protocolFeeDestination is the zero address");
        require(activeTournament.isActive, "No active tournament");
        require(amount > 0, "Cannot buy zero badges");
        bytes32 key = generateKey(streamerAddress, eventId, eventType);
        require(vipBadgeBalance[key][msg.sender] >= amount, "Insufficient badges");
        uint256 price = getPrice(vipBadgeSupply[key] - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 subjectFee = price * subjectFeePercent / 1 ether;
        uint256 tournamentFee = price * tournamentFeePercent / 1 ether;  // Assume tournamentFeePercent is defined

        // Update the contract state
        vipBadgeSupply[key] -= amount;
        vipBadgeBalance[key][msg.sender] -= amount;
        activeTournament.vipPooledEth += tournamentFee;

        // Send protocol and subject fees
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = streamerAddress.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");

        // Send the remaining amount to the seller
        uint256 netAmount = price - protocolFee - subjectFee - tournamentFee;
        (bool success3, ) = msg.sender.call{value: netAmount}("");
        require(success3, "Unable to send funds");
    }
}