// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SolarToken ($SOLAR)
 * @notice The in-game token for SunCity - a solar farm building game on Base
 * @dev ERC20 token with:
 *      - 5% tax on buys/sells (2% rewards, 2% treasury, 1% liquidity)
 *      - Disinflationary emission model
 *      - Limited admin functions (pause, update recipients)
 */
contract SolarToken is ERC20, Ownable, ReentrancyGuard {
    // ============================================
    // CONSTANTS
    // ============================================

    uint256 public constant MAX_TAX = 500; // 5% max (basis points)
    uint256 public constant BASIS_POINTS = 10000;

    // Tax distribution (in basis points of the tax amount)
    uint256 public constant REWARDS_SHARE = 4000;  // 40% of tax = 2% of trade
    uint256 public constant TREASURY_SHARE = 4000; // 40% of tax = 2% of trade
    uint256 public constant LIQUIDITY_SHARE = 2000; // 20% of tax = 1% of trade

    // ============================================
    // STATE VARIABLES
    // ============================================

    // Tax settings
    uint256 public buyTax = 500;  // 5% = 500 basis points
    uint256 public sellTax = 500; // 5% = 500 basis points
    bool public taxEnabled = true;

    // Tax recipients
    address public rewardsPool;
    address public treasury;
    address public liquidityPool;

    // DEX pairs (transfers to/from these addresses are taxed)
    mapping(address => bool) public isDexPair;

    // Excluded from tax (treasury, liquidity operations, etc.)
    mapping(address => bool) public isExcludedFromTax;

    // Emission control
    uint256 public emissionRate; // Tokens per second
    uint256 public emissionDecayRate = 9900; // 99% = 1% decay per epoch (basis points)
    uint256 public lastEmissionUpdate;
    uint256 public totalEmitted;

    // Pause functionality
    bool public paused = false;

    // ============================================
    // EVENTS
    // ============================================

    event TaxCollected(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 rewardsAmount,
        uint256 treasuryAmount,
        uint256 liquidityAmount
    );
    event DexPairUpdated(address indexed pair, bool status);
    event TaxExclusionUpdated(address indexed account, bool excluded);
    event TaxRecipientsUpdated(address rewards, address treasury, address liquidity);
    event EmissionRateUpdated(uint256 newRate);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event Paused(bool status);

    // ============================================
    // ERRORS
    // ============================================

    error ContractPaused();
    error ZeroAddress();
    error InvalidTaxRate();
    error NotAuthorized();

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor(
        address _rewardsPool,
        address _treasury,
        address _liquidityPool,
        uint256 _initialEmissionRate
    ) ERC20("Solar Token", "SOLAR") Ownable(msg.sender) {
        if (_rewardsPool == address(0) || _treasury == address(0) || _liquidityPool == address(0)) {
            revert ZeroAddress();
        }

        rewardsPool = _rewardsPool;
        treasury = _treasury;
        liquidityPool = _liquidityPool;
        emissionRate = _initialEmissionRate;
        lastEmissionUpdate = block.timestamp;

        // Exclude key addresses from tax
        isExcludedFromTax[msg.sender] = true;
        isExcludedFromTax[address(this)] = true;
        isExcludedFromTax[_rewardsPool] = true;
        isExcludedFromTax[_treasury] = true;
        isExcludedFromTax[_liquidityPool] = true;
    }

    // ============================================
    // MODIFIERS
    // ============================================

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // ============================================
    // TRANSFER OVERRIDE (Tax Logic)
    // ============================================

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        // Skip tax for minting, burning, or excluded addresses
        if (from == address(0) || to == address(0)) {
            super._update(from, to, amount);
            return;
        }

        if (!taxEnabled || isExcludedFromTax[from] || isExcludedFromTax[to]) {
            super._update(from, to, amount);
            return;
        }

        // Determine if this is a buy or sell
        bool isBuy = isDexPair[from];
        bool isSell = isDexPair[to];

        if (!isBuy && !isSell) {
            // Regular transfer, no tax
            super._update(from, to, amount);
            return;
        }

        // Calculate tax
        uint256 taxRate = isBuy ? buyTax : sellTax;
        uint256 taxAmount = (amount * taxRate) / BASIS_POINTS;
        uint256 transferAmount = amount - taxAmount;

        if (taxAmount > 0) {
            // Distribute tax
            uint256 rewardsAmount = (taxAmount * REWARDS_SHARE) / BASIS_POINTS;
            uint256 treasuryAmount = (taxAmount * TREASURY_SHARE) / BASIS_POINTS;
            uint256 liquidityAmount = taxAmount - rewardsAmount - treasuryAmount;

            // Transfer tax portions
            super._update(from, rewardsPool, rewardsAmount);
            super._update(from, treasury, treasuryAmount);
            super._update(from, liquidityPool, liquidityAmount);

            emit TaxCollected(from, to, taxAmount, rewardsAmount, treasuryAmount, liquidityAmount);
        }

        // Transfer remaining amount to recipient
        super._update(from, to, transferAmount);
    }

    // ============================================
    // MINTING (Controlled emission)
    // ============================================

    /**
     * @notice Mint tokens for game rewards
     * @dev Only callable by authorized addresses (game contract)
     * @param to Recipient address
     * @param amount Amount to mint
     * @param reason Description for tracking
     */
    function mintReward(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();

        _mint(to, amount);
        totalEmitted += amount;

        emit TokensMinted(to, amount, reason);
    }

    /**
     * @notice Calculate current emission rate after decay
     * @return Current emission rate per second
     */
    function currentEmissionRate() public view returns (uint256) {
        // Decay emission rate over time (simplified - decay per day)
        uint256 daysPassed = (block.timestamp - lastEmissionUpdate) / 1 days;
        uint256 rate = emissionRate;

        for (uint256 i = 0; i < daysPassed && i < 365; i++) {
            rate = (rate * emissionDecayRate) / BASIS_POINTS;
        }

        return rate;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Pause/unpause transfers (emergency only)
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    /**
     * @notice Update tax recipient addresses
     */
    function setTaxRecipients(
        address _rewardsPool,
        address _treasury,
        address _liquidityPool
    ) external onlyOwner {
        if (_rewardsPool == address(0) || _treasury == address(0) || _liquidityPool == address(0)) {
            revert ZeroAddress();
        }

        // Update exclusions
        isExcludedFromTax[rewardsPool] = false;
        isExcludedFromTax[treasury] = false;
        isExcludedFromTax[liquidityPool] = false;

        rewardsPool = _rewardsPool;
        treasury = _treasury;
        liquidityPool = _liquidityPool;

        isExcludedFromTax[_rewardsPool] = true;
        isExcludedFromTax[_treasury] = true;
        isExcludedFromTax[_liquidityPool] = true;

        emit TaxRecipientsUpdated(_rewardsPool, _treasury, _liquidityPool);
    }

    /**
     * @notice Add or remove a DEX pair address
     */
    function setDexPair(address pair, bool status) external onlyOwner {
        if (pair == address(0)) revert ZeroAddress();
        isDexPair[pair] = status;
        emit DexPairUpdated(pair, status);
    }

    /**
     * @notice Exclude or include address from tax
     */
    function setTaxExclusion(address account, bool excluded) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        isExcludedFromTax[account] = excluded;
        emit TaxExclusionUpdated(account, excluded);
    }

    /**
     * @notice Update emission rate (for game balance adjustments)
     */
    function setEmissionRate(uint256 newRate) external onlyOwner {
        emissionRate = newRate;
        lastEmissionUpdate = block.timestamp;
        emit EmissionRateUpdated(newRate);
    }

    /**
     * @notice Enable or disable tax
     */
    function setTaxEnabled(bool enabled) external onlyOwner {
        taxEnabled = enabled;
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Calculate tax amount for a given transfer
     */
    function calculateTax(
        address from,
        address to,
        uint256 amount
    ) external view returns (uint256 taxAmount, uint256 netAmount) {
        if (!taxEnabled || isExcludedFromTax[from] || isExcludedFromTax[to]) {
            return (0, amount);
        }

        bool isBuy = isDexPair[from];
        bool isSell = isDexPair[to];

        if (!isBuy && !isSell) {
            return (0, amount);
        }

        uint256 taxRate = isBuy ? buyTax : sellTax;
        taxAmount = (amount * taxRate) / BASIS_POINTS;
        netAmount = amount - taxAmount;
    }
}
