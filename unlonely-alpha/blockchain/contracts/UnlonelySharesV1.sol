// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: contracts/Ownable.sol


// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

pragma solidity ^0.8.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
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

// File: contracts/FriendtechShares.sol



pragma solidity >=0.8.2 <0.9.0;

contract UnlonelySharesV1 is Ownable {
    address public protocolFeeDestination;
    uint256 public protocolFeePercent;
    uint256 public subjectFeePercent;

    event Trade(address trader, address subject, bool isBuy, bool isYay, uint256 shareAmount, uint256 ethAmount, uint256 protocolEthAmount, uint256 subjectEthAmount, uint256 supply);
    event EventVerified(address indexed sharesSubject, bool result);
    event Payout(address indexed voter, uint256 amount);
    

    // this is a mapping between streamer and their holders which each own an amount of yay/nay shares
    mapping(address => mapping(address => uint256)) public yaySharesBalance;
    mapping(address => mapping(address => uint256)) public naySharesBalance;

    // this is a mapping between streamer and how many shares have been purchased
    mapping(address => uint256) public yaySharesSupply;
    mapping(address => uint256) public naySharesSupply;

    mapping(address => bool) public eventVerified;
    mapping(address => bool) public eventResult;
    mapping(address => bool) public isVerifier;

    // this is a mapping between streamer and total amount of ETH in the pool
    mapping(address => uint256) public pooledEth;

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Caller is not a verifier");
        _;
    }

    constructor() {
        // Set the contract deployer as the initial verifier
        isVerifier[msg.sender] = true;
    }

    function addVerifier(address verifier) public onlyOwner {
        isVerifier[verifier] = true;
    }

    function removeVerifier(address verifier) public onlyOwner {
        isVerifier[verifier] = false;
    }

    function verifyEvent(address sharesSubject, bool result) public onlyVerifier {
        require(!eventVerified[sharesSubject], "Event already verified");
        eventVerified[sharesSubject] = true;
        eventResult[sharesSubject] = result;
        emit EventVerified(sharesSubject, result);
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

    function getPrice(address sharesSubject, uint256 amount, bool isYay, bool isBuying) public view returns (uint256) {
        uint256 supply = isYay ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        uint256 adjustedSupply = isBuying ? supply : amount > supply ? 0 : supply - amount;
        uint256 sum1 = adjustedSupply == 0 ? 0 : (adjustedSupply - 1) * adjustedSupply * (2 * (adjustedSupply - 1) + 1) / 6;
        uint256 sum2 = (adjustedSupply == 0 && amount == 1) ? 0 : (adjustedSupply - 1 + amount) * (adjustedSupply + amount) * (2 * (adjustedSupply - 1 + amount) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 16000;
    }

    function getHolderSharesBalance(address sharesSubject, address holder, bool isYay) public view returns (uint256) {
        return isYay ? yaySharesBalance[sharesSubject][holder] : naySharesBalance[sharesSubject][holder];
    }

    // def: buyShares takes in streamer address (ex: 0xTed), amount of shares purchased, and if its yay or nay
    function buyShares(address sharesSubject, uint256 amount, bool isYay) public payable {
        uint256 supply = isYay ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        require(supply > 0 || sharesSubject == msg.sender, "Only the shares owner subject can buy the first share");
        uint256 price = getPrice(sharesSubject, amount, isYay, true);
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
        uint256 supply = isYay ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        require(supply > amount, "Cannot sell more shares than the current supply");
        
        uint256 userShares = isYay ? yaySharesBalance[sharesSubject][msg.sender] : naySharesBalance[sharesSubject][msg.sender];
        require(userShares >= amount, "You don't have enough shares to sell");

        uint256 price = getPrice(sharesSubject, amount, isYay, false);
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
        
        // Transfer the net amount to the seller
        payable(msg.sender).transfer(netAmount);
        
        // Transfer the protocol and subject fees
        (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
        (bool success2, ) = sharesSubject.call{value: subjectFee}("");
        require(success1 && success2, "Unable to send funds");
    }


    function claimPayout(address sharesSubject) public {
        require(eventVerified[sharesSubject], "Event not yet verified");

        bool result = eventResult[sharesSubject];
        uint256 userShares = result ? yaySharesBalance[sharesSubject][msg.sender] : naySharesBalance[sharesSubject][msg.sender];

        require(userShares > 0, "No shares to claim for");

        uint256 totalPool = pooledEth[sharesSubject];
        uint256 totalWinningShares = result ? yaySharesSupply[sharesSubject] : naySharesSupply[sharesSubject];
        uint256 userPayout = totalPool * userShares / totalWinningShares;

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

        payable(msg.sender).transfer(userPayout);
        emit Payout(msg.sender, userPayout);
    }

}

