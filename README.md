# Swap DVGToken to DVDToken

## Development

### Compile

```
npx hardhat compile

```

### Deploy

```
npx hardhat deploy --network <network> --tags <network>_UpgradeDVG_deploy
npx hardhat deploy --network <network> --tags <network>_UpgradeDVG_verify

```

## Add items to the whitelist

```
npx hardhat run --network <network> scripts/addWhiteList.js
```