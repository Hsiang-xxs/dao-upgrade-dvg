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
      vaultAddress: "0x0316e3f6e0a4c01ee54e27cb1c8b2f7655d4cb62",  // TODO: Update after DVD deployed on Mainnet
    },
  },
  kovan: {
    Global: {
      proxyAdmin: "0xeFd9928Aa5A192C0267CdAed43235006B7A28628",  // TODO: Update with the correct address
      signerAddress: "0xeFd9928Aa5A192C0267CdAed43235006B7A28628",  // TODO: Update with the correct address
    },
    DVG: {
      tokenAddress: "0xea9726eFc9831EF0499fD4Db4Ab143F15a797673",
    },
    DVD: {
      tokenAddress: "0x07de306FF27a2B630B1141956844eB1552B956B5",  // TODO: Update after DVD deployed on Kovan
      vaultAddress: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",  // TODO: Update after DVD deployed on Kovan
    },
  },
};
