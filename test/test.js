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
const amount1 = "845845210716180000000000";
const signature1 = "0xc28b78553e45b489e4d2b49b90a7f70b18427742cb621a4468c8f2158e1de74e32cfec3ee7f0722386832128344f1806e2660b1261e28dd219a2f7b19ae148c61b";

const user2Address = "0xc6c97d38ce7589c0881f6f845ac035042f088650";
const amount2 = "467968000000000000";
const signature2 = "0x6b86c593be911595770635ae230052d48f4bd2b0270c24ae794a0100a2dfa0527271020d268d38f86dbe09a2f31879f0b4a3730fe050f51e0baa1412506853951c";

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
      expect(await contract.signer()).to.equal(network_.Global.signerAddress);
      expect(await contract.totalSwapped()).to.equal(0);
    });

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
  });
});
