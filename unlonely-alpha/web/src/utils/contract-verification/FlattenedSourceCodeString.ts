export const flattened = `// Sources flattened with hardhat v2.18.2 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v4.8.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

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


// File @openzeppelin/contracts/access/Ownable.sol@v4.8.1

// Original license: SPDX_License_Identifier: MIT
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
 * n\`onlyOwnern\`, which can be applied to your functions to restrict their use to
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
     * n\`onlyOwnern\` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (n\`newOwnern\`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (n\`newOwnern\`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.8.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when n\`valuen\` tokens are moved from one account (n\`fromn\`) to
     * another (n\`ton\`).
     *
     * Note that n\`valuen\` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a n\`spendern\` for an n\`ownern\` is set by
     * a call to {approve}. n\`valuen\` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by n\`accountn\`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves n\`amountn\` tokens from the caller's account to n\`ton\`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that n\`spendern\` will be
     * allowed to spend on behalf of n\`ownern\` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets n\`amountn\` as the allowance of n\`spendern\` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves n\`amountn\` tokens from n\`fromn\` to n\`ton\` using the
     * allowance mechanism. n\`amountn\` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}


// File @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol@v4.8.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}


// File @openzeppelin/contracts/token/ERC20/ERC20.sol@v4.8.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;



/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning n\`falsen\` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if n\`decimalsn\` equals n\`2n\`, a balance of n\`505n\` tokens should
     * be displayed to a user as n\`5.05n\` (n\`505 / 10 ** 2n\`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless this function is
     * overridden;
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - n\`ton\` cannot be the zero address.
     * - the caller must have a balance of at least n\`amountn\`.
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If n\`amountn\` is the maximum n\`uint256n\`, the allowance is not updated on
     * n\`transferFromn\`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - n\`spendern\` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum n\`uint256n\`.
     *
     * Requirements:
     *
     * - n\`fromn\` and n\`ton\` cannot be the zero address.
     * - n\`fromn\` must have a balance of at least n\`amountn\`.
     * - the caller must have allowance for n\`n\`fromn\`n\`'s tokens of at least
     * n\`amountn\`.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to n\`spendern\` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - n\`spendern\` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to n\`spendern\` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - n\`spendern\` cannot be the zero address.
     * - n\`spendern\` must have allowance for the caller of at least
     * n\`subtractedValuen\`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves n\`amountn\` of tokens from n\`fromn\` to n\`ton\`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - n\`fromn\` cannot be the zero address.
     * - n\`ton\` cannot be the zero address.
     * - n\`fromn\` must have a balance of at least n\`amountn\`.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /** @dev Creates n\`amountn\` tokens and assigns them to n\`accountn\`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with n\`fromn\` set to the zero address.
     *
     * Requirements:
     *
     * - n\`accountn\` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys n\`amountn\` tokens from n\`accountn\`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with n\`ton\` set to the zero address.
     *
     * Requirements:
     *
     * - n\`accountn\` cannot be the zero address.
     * - n\`accountn\` must have at least n\`amountn\` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Sets n\`amountn\` as the allowance of n\`spendern\` over the n\`ownern\` s tokens.
     *
     * This internal function is equivalent to n\`approven\`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - n\`ownern\` cannot be the zero address.
     * - n\`spendern\` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates n\`ownern\` s allowance for n\`spendern\` based on spent n\`amountn\`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when n\`fromn\` and n\`ton\` are both non-zero, n\`amountn\` of n\`n\`fromn\`n\`'s tokens
     * will be transferred to n\`ton\`.
     * - when n\`fromn\` is zero, n\`amountn\` tokens will be minted for n\`ton\`.
     * - when n\`ton\` is zero, n\`amountn\` of n\`n\`fromn\`n\`'s tokens will be burned.
     * - n\`fromn\` and n\`ton\` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when n\`fromn\` and n\`ton\` are both non-zero, n\`amountn\` of n\`n\`fromn\`n\`'s tokens
     * has been transferred to n\`ton\`.
     * - when n\`fromn\` is zero, n\`amountn\` tokens have been minted for n\`ton\`.
     * - when n\`ton\` is zero, n\`amountn\` of n\`n\`fromn\`n\`'s tokens have been burned.
     * - n\`fromn\` and n\`ton\` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}


// File @openzeppelin/contracts/security/ReentrancyGuard.sol@v4.8.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from n\`ReentrancyGuardn\` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single n\`nonReentrantn\` guard, functions marked as
 * n\`nonReentrantn\` may not call one another. This can be worked around by making
 * those functions n\`privaten\`, and then adding n\`externaln\` n\`nonReentrantn\` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a n\`nonReentrantn\` function from another n\`nonReentrantn\`
     * function is not supported. It is possible to prevent this from happening
     * by making the n\`nonReentrantn\` function external, and making it call a
     * n\`privaten\` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}


// File contracts/TempTokenV1.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.2;
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
    uint256 public highestTotalSupply;
    bool public hasHitTotalSupplyThreshold;
    bool public isAlwaysTradeable;

    event Mint(address indexed account, uint256 amount, address indexed streamerAddress, address indexed tokenAddress, uint256 totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent, uint256 endTimestamp, bool hasHitTotalSupplyThreshold);
    event Burn(address indexed account, uint256 amount, address indexed streamerAddress, address indexed tokenAddress, uint256 totalSupply, uint256 protocolFeePercent, uint256 streamerFeePercent);
    event TokenDurationExtended(uint256 indexed endTimestamp, address indexed tokenAddress);
    event TokenDurationAndThresholdIncreased(uint256 indexed endTimestamp, uint256 indexed totalSupplyThreshold, address indexed tokenAddress);
    event SendRemainingFundsToCreatorAfterTokenExpiration(address indexed account, uint256 balance);
    event TotalSupplyThresholdUpdated(uint256 indexed totalSupplyThreshold, address indexed tokenAddress, bool hasHitTotalSupplyThreshold);
    event TokenAlwaysTradeableSet(bool indexed isAlwaysTradeable, address indexed tokenAddress);
    
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
        require(block.timestamp <= endTimestamp || isAlwaysTradeable, "Active phase has ended and token is no longer tradeable");
        _;
    }

    /**
        * @dev endedPhase modifier checks if the current block timestamp is greater than the endTimestamp.
     */
    modifier endedPhase() {
        require(block.timestamp > endTimestamp && !isAlwaysTradeable, "Active phase has not ended or token is still tradeable");
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
        isAlwaysTradeable = false;
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

        if(totalSupply() > highestTotalSupply) {
            highestTotalSupply = totalSupply();
        }

        // Check if total supply has hit the threshold for the first time
        if(totalSupply() >= totalSupplyThreshold && !hasHitTotalSupplyThreshold) {
            endTimestamp += 25 hours;
            hasHitTotalSupplyThreshold = true; // Ensure this logic runs only once
            emit TokenDurationAndThresholdIncreased(endTimestamp, totalSupplyThreshold, address(this));
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

        emit Mint(msg.sender, _amount, owner(), address(this), totalSupply(), protocolFeePercent, streamerFeePercent, endTimestamp, hasHitTotalSupplyThreshold);
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

        emit Burn(msg.sender, _amount, owner(), address(this), totalSupply(), protocolFeePercent, streamerFeePercent);
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
        require(_newThreshold > totalSupplyThreshold, "New threshold must be greater than the current threshold");
        hasHitTotalSupplyThreshold = false;
        totalSupplyThreshold = _newThreshold;
        emit TotalSupplyThresholdUpdated(totalSupplyThreshold, address(this), hasHitTotalSupplyThreshold);
    }

    /**
        * @dev increaseEndTimestamp function allows the token owner to increase the endTimestamp by a specified duration.
        * @param _additionalDurationInSeconds is the duration to increase the endTimestamp by.
        * This function is only callable by the factory contract.
     */

    function increaseEndTimestamp(uint256 _additionalDurationInSeconds) public {
        require(msg.sender == factoryAddress, "Only the factory can increase the end timestamp");
        endTimestamp += _additionalDurationInSeconds;
        emit TokenDurationExtended(endTimestamp, address(this));
    }

    function setAlwaysTradeable(bool _isAlwaysTradeable) public {
        require(msg.sender == factoryAddress, "Only the factory can set this value");
        isAlwaysTradeable = _isAlwaysTradeable;
        emit TokenAlwaysTradeableSet(_isAlwaysTradeable, address(this));
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
`