require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('@nomiclabs/hardhat-ethers');
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("hardhat-gas-reporter");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const apiKey = process.env.ETHERSCAN_API_KEY;
const mainnetUrl = process.env.ALCHEMY_URL_MAINNET;
const mainnetBlockNumber = 12801522;

module.exports = {
  solidity: {
    compilers: [{
      version: "0.7.6",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000
        }
      }
    }],
  },
  networks: {
    hardhat: {
      forking: {
        url: mainnetUrl,
        blockNumber: mainnetBlockNumber,
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: apiKey
  },
  gasReporter: {
    enabled: true
  },
  mocha: {
    timeout: 50000
  },
};
