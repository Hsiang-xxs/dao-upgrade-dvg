require("dotenv").config();
const { ethers } = require("hardhat");
const whiteList = require("./whitelist.js");

async function main() {
    const signerWallet = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);
    
    console.log(`Signer address: ${signerWallet.address}`);

    const totalCount = whiteList.length;
    for (var i = 0; i < totalCount; i ++) {
        const user = whiteList[i][0];
        const allowedAmount = whiteList[i][1];

        const message = ethers.utils.solidityKeccak256(
            ["address", "uint256"],
            [user, allowedAmount]
        );
        const signature = await signerWallet.signMessage(ethers.utils.arrayify(message));
        console.log(`${user}: ${signature}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });