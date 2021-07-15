const { ethers } = require("hardhat");
const whiteList = require("./whitelist.js");

const BULK_SIZE = 50;

async function main() {
    const [deployer] = await ethers.getSigners();

    const proxy = await ethers.getContract("UpgradeDVGProxy");
    const implArtifact = await deployments.getArtifact("UpgradeDVG");
    const contract = new ethers.Contract(proxy.address, implArtifact.abi, deployer);
    console.log(`Contract address: ${proxy.address}\n`);

    const totalCount = whiteList.length;
    
    for (var index = 0; index < totalCount; ) {
        const bulkSize = (totalCount - index) < BULK_SIZE ? (totalCount - index) : BULK_SIZE
        var addresses = [];
        var amounts = [];
        for (var i = 0; i < bulkSize; i ++) {
            addresses.push(whiteList[index+i][0]);
            amounts.push(whiteList[index+i][1]);
        }
        console.log(`Adding the addresses[${index} : ${index+bulkSize-1}] ...`);

        try {
            const gas = await contract.estimateGas.addWhiteList(addresses, amounts);
            console.log(`The estimated gas: ${gas.toString()}`);
            const tx = await contract.addWhiteList(addresses, amounts);
            console.log(`The txid: ${tx.hash}`)
            const receipt = await tx.wait();
            if (!receipt || !receipt.blockNumber) {
                console.error(`The transaction failed`);
                break;
            }
        } catch(e) {
            console.error(e);
            break;
        }

        index += bulkSize;
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });