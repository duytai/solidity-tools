const fs = require('fs')
const path = require('path')
const VM = require('ethereumjs-vm')
const Trie = require('merkle-patricia-tree')
const rlp = require('rlp')
const shell = require('shelljs')
const { 
  runTx, 
  encodeParam, 
  setup,
  analyzer,
} = require('./lib')

module.exports = ({ buildPath, numTest }) => {
  const abiFiles = shell.ls(`${path.join(buildPath, '*.abi')}`)
  abiFiles.forEach(async (abiFile) => {
    const filename = abiFile.slice(0, -4)
    const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8')) 
    const bin = fs.readFileSync(`${filename}.bin`, 'utf8') 
    for (let i = 0; i < numTest; i++) {
      const stateTrie = new Trie()
      const vm = new VM({ state: stateTrie })
      const keyPair = require('./data/key-pair.json')
      const constructor = abi.find(({ type }) => type === 'constructor')
      const funcs = abi.filter(({ type }) => type === 'function')
      const param = constructor ? encodeParam(constructor, i).toString('hex') : ''
      const rawTx1 = {
        nonce: `0x00`,
        gasPrice: '0x09184e72a000',
        gasLimit: '0x90710',
        data: `0x${bin}${param}` 
      }   
      await setup({ keyPair, stateTrie })
      vm.on('step', analyzer)
      console.log('>> constructor')
      const { createdAddress } = await runTx({ keyPair, vm, rawTx: rawTx1 })
      for (let j = 0; j < funcs.length; j++) {
        const rawTx2 = {
          nonce: `0x00`,
          gasPrice: '0x09184e72a000',
          gasLimit: '0x20710',
          value: '0x00',
          to: `0x${createdAddress.toString('hex')}`,
          data: `0x${encodeParam(funcs[j], i).toString('hex')}` 
        }
        console.log(rawTx2)
        console.log(`>> func ${funcs[j].name}`)
        await runTx({ keyPair, vm, rawTx: rawTx2 })
      }
    }
  })
}
