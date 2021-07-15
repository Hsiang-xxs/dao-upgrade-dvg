// SPDX-License-Identifier: GPLv3
pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract UpgradeDVG is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct Holder {
        uint256 balance;
        uint256 swapped;
    }

    IERC20 public dvg;
    IERC20 public dvd;
    address public vault;
    mapping(address => Holder) public dvgHolders;
    uint256 public dvgHolderCount;
    uint256 public totalBalance;
    uint256 public totalSwapped;

    event DvgUpgrade(address indexed user, uint256 dvdAmount);
    event DvdAirdrop(address indexed user, uint256 dvdAmount);

    /// @dev Require that the caller must be an EOA account to avoid flash loans
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Not EOA");
        _;
    }

    function initialize(address _dvg, address _dvd, address _vault) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();

        dvg = IERC20(_dvg);
        dvd = IERC20(_dvd);
        vault = _vault;
    }

    receive() external payable {
        require(false, "We do not accept the ETH");
    }

    /**
     * @notice Add the white list.
     * @param _addresses Addresses of DVG token holders
     * @param _amounts Amounts which the holders are holding
     */
    function addWhiteList(address[] memory _addresses, uint256[] memory _amounts) external onlyOwner {
        require(0 < _addresses.length, "No address input");
        require(_addresses.length == _amounts.length, "Mismatch the parameters");

        for (uint i = 0; i < _addresses.length; i ++) {
            address user = _addresses[i];
            uint256 amount = _amounts[i];
            require(user != address(0), "The address is invalid");
            require(0 < amount, "The amount is invalid");
            require(dvgHolders[user].balance == 0, "This address already added");

            dvgHolders[user] = Holder({
                balance: amount,
                swapped: 0
            });
            totalBalance = totalBalance.add(amount);
        }

        dvgHolderCount = dvgHolderCount.add(_addresses.length);
    }

    /**
     * @notice Swap the DVG token in the same amount of DVD token.
     * @param _amount Amount to upgrade
     */
    function upgradeDVG(uint256 _amount) external onlyEOA nonReentrant returns(uint256 dvdAmount) {
        require(0 < _amount, "The amount is invalid");
        address sender = msg.sender;
        Holder memory holder = dvgHolders[sender];
        uint256 pending = holder.balance.sub(holder.swapped);
        require(0 < pending, "Sender already upgraded token for the allowed amount");

        dvdAmount = (_amount < pending) ? _amount : pending;

        dvgHolders[sender].swapped = holder.swapped.add(dvdAmount);
        totalSwapped = totalSwapped.add(dvdAmount);

        dvg.safeTransferFrom(sender, address(this), dvdAmount);
        dvd.safeTransferFrom(vault, sender, dvdAmount);
        emit DvgUpgrade(sender, dvdAmount);
    }

    /**
     * @notice Airdrop the DVD tokens to the specified addresses.
     * @param _addresses Addresses of DVG token holders.
     */
    function airdropDVD(address[] memory _addresses) external onlyOwner {
        require(0 < _addresses.length, "No address input");

        for (uint i = 0; i < _addresses.length; i ++) {
            address user = _addresses[i];
            Holder memory holder = dvgHolders[user];
            uint256 pending = holder.balance.sub(holder.swapped);
            if (0 < pending) {
                totalSwapped = totalSwapped.add(pending);
                holder.swapped = holder.balance;
                dvgHolders[user] = holder;

                dvd.safeTransferFrom(vault, user, pending);
                emit DvdAirdrop(user, pending);
            }
        }
    }
}