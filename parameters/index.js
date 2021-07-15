module.exports = {
  mainnet: {
    Global: {
      proxyAdmin: "0xeFd9928Aa5A192C0267CdAed43235006B7A28628",  // TODO: Update with the correct address
      signerAddress: "0xeFd9928Aa5A192C0267CdAed43235006B7A28628",  // TODO: Update with the correct address
    },
    DVG: {
      tokenAddress: "0x51e00a95748DBd2a3F47bC5c3b3E7B3F0fea666c",
    },
    DVD: {
      tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",  // TODO: Update after DVD deployed on Mainnet
      vaultAddress: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",  // TODO: Update after DVD deployed on Mainnet
    },
  },
  kovan: {
    Global: {
      proxyAdmin: "0xA1b0176B24cFB9DB3AEe2EDf7a6DF129B69ED376",  // TODO: Update with the correct address
      signerAddress: "0xA1b0176B24cFB9DB3AEe2EDf7a6DF129B69ED376",  // TODO: Update with the correct address
    },
    DVG: {
      tokenAddress: "0xea9726eFc9831EF0499fD4Db4Ab143F15a797673",
    },
    DVD: {
      tokenAddress: "0x6639c554A299D58284e36663f609a7d94526fEC0",  // TODO: Update after DVD deployed on Kovan
      vaultAddress: "0x46d5D81D9C855ed58f35447cD0c1Dd0e07e967D2",  // TODO: Update after DVD deployed on Kovan
    },
  },
};
