const { ethers, run } = require("hardhat");
const { kovan: network_ } = require("../../parameters");

module.exports = async ({ deployments }) => {
  const implementation = await ethers.getContract("UpgradeDVG");
  try {
    await run("verify:verify", {
      address: implementation.address,
      contract: "contracts/UpgradeDVG.sol:UpgradeDVG",
    });
  } catch (e) {
  }

  const upgradeDVGArtifact = await deployments.getArtifact("UpgradeDVG");
  const iface = new ethers.utils.Interface(JSON.stringify(upgradeDVGArtifact.abi));
  const data = iface.encodeFunctionData("initialize", [
      network_.DVG.tokenAddress,
      network_.DVD.tokenAddress,
      network_.DVD.vaultAddress,
      network_.Global.signerAddress,
  ]);

  const proxy = await ethers.getContract("UpgradeDVGProxy");
  try {
    await run("verify:verify", {
      address: proxy.address,
      constructorArguments: [
        implementation.address,
        network_.Global.proxyAdmin,
        data,
      ],
      contract: "contracts/UpgradeDVGProxy.sol:UpgradeDVGProxy",
    });
  } catch (e) {
  }
};
module.exports.tags = ["kovan_UpgradeDVG_verify"];
