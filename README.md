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

## Generate signatures for the allowed users

Update scripts/whitelist.js with the correct holder's information.

```
npx hardhat run scripts/createSignature.js
```