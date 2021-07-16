const { expect } = require("chai");
const { ethers, deployments } = require("hardhat");
const { expectRevert } = require('@openzeppelin/test-helpers');
const ERC20_ABI = require("../node_modules/@openzeppelin/contracts/build/contracts/ERC20.json").abi;

const { mainnet: network_ } = require("../parameters");
const { sendEth, UInt256Max } = require('./utils/Ethereum');

var decimals = 0;
const toAmount = (qty) => {
  return ethers.utils.parseUnits(qty.toString(), decimals);
}

const user1Address = "0xb41e620f88c54d91d8945c91cc31bd467c012696";
const amount1 = "1000000";
const signature1 = "0x382a0485ac41e4da8a509b013885a2eaab42a698b5be8b4f6bef894684f793cb7590080e28d6b441e123d0f78d704fcf3bd8ced2bced638cb16494191998727e1c";

const user2Address = "0x34f0c3c7614f134c4101ea78f318c311c0291435";
const amount2 = "2000000";
const signature2 = "0x84695b22c8c68a6e00a65e7234ff2e885a5f73be057548f5819a783346e08c136783949fd81d9ce968b99a8d9c81690db43f8365811971a64e0f240fb77719461b";

describe('UpgradeDVG', () => {

  let owner, vault, proxyAdmin, user1, user2;
  let dvg, dvd, proxyContract, contract;
  let upgradeDVGArtifact;
  
  before(async () => {
    [owner, a1, a2, ...accounts] = await ethers.getSigners();

    upgradeDVGArtifact = await deployments.getArtifact("UpgradeDVG");

    vault = await ethers.getSigner(network_.DVD.vaultAddress);
    proxyAdmin = await ethers.getSigner(network_.Global.proxyAdmin);
    user1 = await ethers.getSigner(user1Address);
    user2 = await ethers.getSigner(user2Address);

    dvg = new ethers.Contract(network_.DVG.tokenAddress, ERC20_ABI, owner);
    dvd = new ethers.Contract(network_.DVD.tokenAddress, ERC20_ABI, owner);
    decimals = await dvg.decimals();
  });

  beforeEach(async () => {
    await deployments.fixture(["hardhat"])
    await network.provider.request({method: "hardhat_impersonateAccount", params: [user1Address]});
    await network.provider.request({method: "hardhat_impersonateAccount", params: [user2Address]});

    proxyContract = await ethers.getContract("UpgradeDVGProxy")
    contract = new ethers.Contract(proxyContract.address, upgradeDVGArtifact.abi, owner);

    await sendEth(a1.address, vault.address, '1');
    await sendEth(a1.address, user1.address, '1');
    await sendEth(a1.address, user2.address, '1');
    await dvd.connect(vault).approve(contract.address, UInt256Max());
  });

  describe('UpgradeDVGProxy', () => {
    it('should has the correct addresses in', async () => {
      expect(await proxyContract.connect(proxyAdmin).callStatic.admin()).to.equal(network_.Global.proxyAdmin);
    });
  });

  describe('UpgradeDVG', () => {
    it('should has the correct initial values', async () => {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.dvg()).to.equal(dvg.address);
      expect(await contract.dvd()).to.equal(dvd.address);
      expect(await contract.vault()).to.equal(vault.address);
      expect(await contract.totalSwapped()).to.equal(0);
    });
  });

  describe('upgradeDVG method', () => {
    it('should revert when parameter is invalid', async () => {
      await expectRevert(contract.upgradeDVG(0, 0, "0x"), "The amountToSwap is invalid");
      await expectRevert(contract.upgradeDVG(100000, 0, "0x"), "The amountToSwap must be equal or less than allowedAmount");
      await expectRevert(contract.upgradeDVG(100000, amount1, "0x"), "ECDSA: invalid signature length");
      await expectRevert(contract.upgradeDVG(100000, amount1, signature1+"11"), "ECDSA: invalid signature length");
      await expectRevert(contract.upgradeDVG(100000, amount1, signature1), "The specified amount is not allowed for the sender");
      await expectRevert(contract.connect(user1).upgradeDVG(100000, amount1, signature1), "ERC20: transfer amount exceeds allowance");

      await dvg.connect(user1).approve(contract.address, amount1);
      await contract.connect(user1).upgradeDVG(100000, amount1, signature1);
    });

    it('should upgrade with correct amount', async () => {
      await dvg.connect(user1).approve(contract.address, amount1);
      const dvgBalance = await dvg.balanceOf(user1.address)
      const dvdBalance = await dvd.balanceOf(user1.address)

      await contract.connect(user1).upgradeDVG(100000, amount1, signature1);
      expect(await dvg.balanceOf(user1.address)).to.equal(dvgBalance.sub(100000));
      expect(await dvd.balanceOf(user1.address)).to.equal(dvdBalance.add(100000));
      expect(await contract.swappedAmounts(user1.address)).to.equal(100000);
      expect(await contract.totalSwapped()).to.equal(100000);

      await contract.connect(user1).upgradeDVG(100000, amount1, signature1);
      expect(await dvg.balanceOf(user1.address)).to.equal(dvgBalance.sub(200000));
      expect(await dvd.balanceOf(user1.address)).to.equal(dvdBalance.add(200000));
      expect(await contract.swappedAmounts(user1.address)).to.equal(200000);
      expect(await contract.totalSwapped()).to.equal(200000);

      await contract.connect(user1).upgradeDVG(amount1, amount1, signature1);
      expect(await dvg.balanceOf(user1.address)).to.equal(dvgBalance.sub(amount1));
      expect(await dvd.balanceOf(user1.address)).to.equal(dvdBalance.add(amount1));
      expect(await contract.swappedAmounts(user1.address)).to.equal(amount1);
      expect(await contract.totalSwapped()).to.equal(amount1);

      await expectRevert(contract.connect(user1).upgradeDVG(amount1, amount1, signature1), "Sender already upgraded token for the allowed amount");
    });
  });

  describe('airdropDVD method', () => {
    it('should revert when parameter is invalid', async () => {
      await expectRevert(contract.airdropDVD(
        [],
        [amount1, amount2],
        [signature1, signature2]
      ), "No address input");
      await expectRevert(contract.airdropDVD(
        [user1.address, user2.address],
        [amount1, ],
        [signature1, signature2]
      ), "Mismatch the parameters");
      await expectRevert(contract.airdropDVD(
        [user1.address, user2.address],
        [amount1, amount2],
        [signature1]
      ), "Mismatch the parameters");
      await expectRevert(contract.airdropDVD(
        [user1.address, user2.address],
        [amount1, amount2],
        [signature1, signature2+"00"]
      ), "ECDSA: invalid signature length");
      await expectRevert(contract.airdropDVD(
        [user1.address, user1.address],
        [amount1, amount2],
        [signature1, signature2]
      ), "The specified amount is not allowed for the user");
    });

    it('should works with correct amount', async () => {
      await dvg.connect(user1).approve(contract.address, amount1);
      const dvgBalance1 = await dvg.balanceOf(user1.address)
      const dvdBalance1 = await dvd.balanceOf(user1.address)
      const dvgBalance2 = await dvg.balanceOf(user2.address)
      const dvdBalance2 = await dvd.balanceOf(user2.address)

      await contract.connect(user1).upgradeDVG(100000, amount1, signature1);
      await contract.airdropDVD(
        [user1.address, user2.address],
        [amount1, amount2],
        [signature1, signature2]
      );

      expect(await dvg.balanceOf(user1.address)).to.equal(dvgBalance1.sub(100000));
      expect(await dvd.balanceOf(user1.address)).to.equal(dvdBalance1.add(amount1));
      expect(await contract.swappedAmounts(user1.address)).to.equal(amount1);
      expect(await dvg.balanceOf(user2.address)).to.equal(dvgBalance2);
      expect(await dvd.balanceOf(user2.address)).to.equal(dvdBalance2.add(amount2));
      expect(await contract.swappedAmounts(user2.address)).to.equal(amount2);
      expect(await contract.totalSwapped()).to.equal(parseInt(amount1) + parseInt(amount2));

      await expectRevert(contract.connect(user1).upgradeDVG(amount1, amount1, signature1), "Sender already upgraded token for the allowed amount");
    });
  });

});
