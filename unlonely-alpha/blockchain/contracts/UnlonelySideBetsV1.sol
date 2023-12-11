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

contract UnlonelySideBetsV1 is Ownable, ReentrancyGuard {
    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public subjectFeePercent;

    struct SideBet {
        address initiator;
        // person who initiates or creates the bet
        address opponent;
        // person who accepts the bet
        uint256 wagerAmount;
        // amount ETH wagered by each party
        uint256 expirationTime;
        // timestamp that closes bet if no opponents take the bet
        bool isWinnerPicked;
        // self-explanatory
        address winner;
        // winning address
    }

    event SideBetOpened(SideBet sideBet);
    event SideBetAccepted(SideBet sideBet);
    event WinnerPicked(bytes32 eventByte, address winner);
    event SideBetClosed(SideBet sideBet);

    mapping(bytes32 => SideBet) public sideBets;

    // user roles
    mapping(address => bool) public isVerifier;

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Caller is not a verifier");
        _;
    }

    enum EventType {
        YayNayVote,
        VipBadge,
        SideBet
    }

    modifier validEventType(EventType eventType) {
        require(
            eventType == EventType.SideBet,
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
        require(eventId < 10000000, "ID must be less than 10 million");
        return keccak256(abi.encodePacked(eventAddress, eventId, eventType));
    }

    function getOpeningWagerAfterFee(uint256 wagerAmount) public view returns (uint256) {
        uint256 protocolFee = wagerAmount * protocolFeePercent / 1 ether;
        uint256 subjectFee = wagerAmount * subjectFeePercent / 1 ether;
        return wagerAmount + protocolFee + subjectFee;
    }

    function getExistingWager(address eventAddress, uint256 eventId, EventType eventType) public view returns (uint256) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        uint256 wagerAmount = sideBets[eventBytes].wagerAmount;
        return wagerAmount;
    }

    function getExistingWagerAfterFee(address eventAddress, uint256 eventId, EventType eventType) public view returns (uint256) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        uint256 wagerAmount = sideBets[eventBytes].wagerAmount;
        uint256 protocolFee = wagerAmount * protocolFeePercent / 1 ether;
        uint256 subjectFee = wagerAmount * subjectFeePercent / 1 ether;
        return wagerAmount + protocolFee + subjectFee;
    }

    function isSideBetAvailable(address eventAddress, uint256 eventId, EventType eventType) public view returns (bool) {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        return sideBets[eventBytes].expirationTime > block.timestamp && sideBets[eventBytes].opponent == address(0);
    }

    function openSideBet(
        address eventAddress, 
        uint256 eventId, 
        EventType eventType, 
        uint256 wagerAmount, 
        uint256 expirationTime
    ) public payable validEventType(eventType) nonReentrant {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);
        require(sideBets[eventBytes].initiator == address(0), "Sidebet already created");

        uint256 protocolFee = wagerAmount * protocolFeePercent / 1 ether;
        uint256 subjectFee = wagerAmount * subjectFeePercent / 1 ether;
        require(msg.value >= wagerAmount + protocolFee + subjectFee, "Insufficient payment");

        if(msg.value > (wagerAmount + protocolFee + subjectFee)) {
            (bool success, ) =  msg.sender.call{value: msg.value - (wagerAmount + protocolFee + subjectFee)}("");
            require(success, "Unable to send leftover funds");
        }

        sideBets[eventBytes] = SideBet({
            initiator: msg.sender,
            opponent: address(0), // No opponent yet
            wagerAmount: wagerAmount,
            expirationTime: expirationTime,
            isWinnerPicked: false,
            winner: address(0) // No winner yet
        });

        emit SideBetOpened(sideBets[eventBytes]);

        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = eventAddress.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");
    }

    function acceptSideBet(
        address eventAddress, 
        uint256 eventId, 
        EventType eventType
    ) public payable {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);

        // Check if the sidebet exists and is open for an opponent
        require(sideBets[eventBytes].initiator != address(0), "Sidebet does not exist");
        require(sideBets[eventBytes].opponent == address(0), "Sidebet already taken");
        require(sideBets[eventBytes].expirationTime > block.timestamp, "Sidebet expired");
        
        // Validate the wager amount
        uint256 wagerAmount = sideBets[eventBytes].wagerAmount;
        uint256 protocolFee = wagerAmount * protocolFeePercent / 1 ether;
        uint256 subjectFee = wagerAmount * subjectFeePercent / 1 ether;
        require(msg.value >= wagerAmount + protocolFee + subjectFee, "Insufficient payment");

        if(msg.value > (wagerAmount + protocolFee + subjectFee)) {
            (bool success, ) = msg.sender.call{value: msg.value - (wagerAmount + protocolFee + subjectFee)}("");
            require(success, "Unable to send leftover funds");
        }

        // Update the sidebet with the opponent details
        sideBets[eventBytes].opponent = msg.sender;

        emit SideBetAccepted(sideBets[eventBytes]);

        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = eventAddress.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");
    }

    function pickWinner(
        address eventAddress,
        uint256 eventId,
        EventType eventType,
        address winnerAddress
    ) public onlyVerifier {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);

        // Ensure the sidebet exists and is valid
        require(sideBets[eventBytes].initiator != address(0), "Sidebet does not exist");
        require(sideBets[eventBytes].opponent != address(0), "Sidebet not yet accepted");
        require(!sideBets[eventBytes].isWinnerPicked, "Winner already picked");

        // Assign the winner
        sideBets[eventBytes].winner = winnerAddress;
        sideBets[eventBytes].isWinnerPicked = true;

        emit WinnerPicked(eventBytes, winnerAddress);

        // Handle payout
        uint256 totalWager = sideBets[eventBytes].wagerAmount * 2; // Sum of both wagers
        (bool success, ) = winnerAddress.call{value: totalWager}("");
        require(success, "Failed to transfer winnings");
    }

    function closeSideBet(
        address eventAddress,
        uint256 eventId,
        EventType eventType
    ) public {
        bytes32 eventBytes = generateKey(eventAddress, eventId, eventType);

        // Check if the sidebet exists
        require(sideBets[eventBytes].initiator != address(0), "Sidebet does not exist");
        // Ensure that the msg.sender is the initiator of the sidebet
        require(sideBets[eventBytes].initiator == msg.sender, "Only initiator can close the sidebet");
        // Check if sidebet has expired and not yet accepted
        require(block.timestamp >= sideBets[eventBytes].expirationTime, "Sidebet not yet expired");
        require(sideBets[eventBytes].opponent == address(0), "Sidebet already accepted");

        // Refund the wager to the initiator
        uint256 wager = sideBets[eventBytes].wagerAmount;
        address initiator = sideBets[eventBytes].initiator;

        // Reset the sidebet to free up storage and refund gas
        delete sideBets[eventBytes];

        (bool success, ) = initiator.call{value: wager}("");
        require(success, "Refund failed");

        emit SideBetClosed(sideBets[eventBytes]);
    }
}