const fs = require('fs')
const encoder = require('ethereumjs-abi')
const path = require('path')
const VM = require('ethereumjs-vm')
const Account = require('ethereumjs-account')
const Transaction = require('ethereumjs-tx')
const Trie = require('merkle-patricia-tree')
const rlp = require('rlp')
const utils = require('ethereumjs-util')
const shell = require('shelljs')
const Q = require('q')

const encodeParam = (func, testIndex) => {
  const { name = '', inputs } = func 
  const methodId = encoder.methodID(name, inputs.map(({ type }) => type))
  const methodData = encoder.rawEncode(
    inputs.map(({ type }) => type), 
    inputs.map(({ values }) => values[testIndex]))
  return Buffer.concat([ methodId, methodData ]).toString('hex')
} 
const runTx = ({ keyPair, rawTx, vm }) => {
  const { promise, resolve, reject } = Q.defer()
  const tx = new Transaction(rawTx)
  tx.sign(Buffer.from(keyPair.secretKey, 'hex'))
  vm.runTx({ tx }, (_, result) => resolve(result))
  return promise
}
const setup = async ({ keyPair, stateTrie }) => {
  const { promise, resolve, reject } = Q.defer()
  const publicKeyBuf = Buffer.from(keyPair.publicKey, 'hex')
  const address = utils.pubToAddress(publicKeyBuf, true)
  const account = new Account()
  account.balance = '0xf00000000000000001'
  stateTrie.put(address, account.serialize(), (_, result) => resolve(result))
  return promise
}

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
        nonce: '0x00',
        gasPrice: '0x09184e72a000',
        gasLimit: '0x90710',
        data: `${bin}${param}` 
      }   
      await setup({ keyPair, stateTrie })
      const { createdAddress } = await runTx({ keyPair, vm, rawTx: rawTx1 })
      for (let j = 0; j < funcs.length; j++) {
        const rawTx2 = {
          nonce: '0x01',
          gasPrice: '0x09184e72a000',
          gasLimit: '0x20710',
          //value: '0x10',
          to: `0x${createdAddress.toString('hex')}`,
          data: encodeParam(funcs[j], i) 
        }
        await runTx({ keyPair, vm, rawTx: rawTx2 })
      }
    }
  })
}
