const { ethers } = require("hardhat");
const { kovan: network_ } = require("../../parameters");

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  console.log("Now deploying UpgradeDVG on Kovan...");

  const implementation = await deploy("UpgradeDVG", {
    from: deployer.address,
  });
  console.log("UpgradeDVG implementation address: ", implementation.address);

  const upgradeDVGArtifact = await deployments.getArtifact("UpgradeDVG");
  const iface = new ethers.utils.Interface(JSON.stringify(upgradeDVGArtifact.abi));
  const data = iface.encodeFunctionData("initialize", [
      network_.DVG.tokenAddress,
      network_.DVD.tokenAddress,
      network_.DVD.vaultAddress,
      network_.Global.signerAddress,
  ]);

  const proxy = await deploy("UpgradeDVGProxy", {
    from: deployer.address,
    args: [
      implementation.address,
      network_.Global.proxyAdmin,
      data,
    ],
  });
  console.log("UpgradeDVG proxy address: ", proxy.address);
};
module.exports.tags = ["kovan_UpgradeDVG_deploy"];
