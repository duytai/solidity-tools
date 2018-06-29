# solidity-tools

Allow users to download contracts and count coverages by generating random testcases

## Install
```bash
npm i -g soto
```

## Usage
```bash
soto -d 10 # download 10 contracts from eth network
soto -c    # compile all contracts in current folder
soto -g 10 # generate 10 testcases for each contract
soto -e 10 # execute 10 testescase 
soto -r    # clear current folder
```
full log is saved to `full.log`
