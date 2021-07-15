const { network } = require("hardhat");
const { mainnet: network_ } = require("../../parameters");

module.exports = async () => {
};

module.exports.tags = ["hardhat"];
module.exports.dependencies = [
  "hardhat_reset",
  "mainnet"
];
