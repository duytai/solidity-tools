const fs = require('fs')
const path = require('path')
const VM = require('ethereumjs-vm')
const Trie = require('merkle-patricia-tree')
const rlp = require('rlp')
const shell = require('shelljs')
const { last } = require('underscore')
const { expect } = require('chai')
const { 
  runTx, 
  encodeParam, 
  setup,
  Analyzer,
  codeSplitter,
  Reporter,
} = require('./lib')

module.exports = ({ buildPath, numTest }) => {
  fs.readdir(buildPath, (_, files = []) => {
    const abis = files.filter(f => /\.abi$/.test(f))
    expect(abis.length).gt(0)
    const abiSample = JSON.parse(fs.readFileSync(path.join(buildPath, abis[0]), 'utf8'))
    abiSample
      .filter(f => (f.type === 'function' || f.type === 'constructor') && f.inputs)
      .forEach(f => f.inputs.forEach(input => expect(input.values.length).gte(0)))
    const abiFiles = shell.ls(`${path.join(buildPath, '*.abi')}`)
    abiFiles.forEach(async (abiFile) => {
      const fileWithoutExtension = abiFile.slice(0, -4)
      const filename = last(fileWithoutExtension.split('/'))
      const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8')) 
      const bin = fs.readFileSync(`${fileWithoutExtension}.bin`, 'utf8') 
      const { deployCode, createdCode } = codeSplitter(bin)
      const reporter = new Reporter(filename) 
      for (let i = 0; i < numTest; i++) {
        const stateTrie = new Trie()
        const vm = new VM({ state: stateTrie })
        const analyzer = new Analyzer(bin)
        const keyPair = require('./data/key-pair.json')
        const constructor = abi.find(({ type }) => type === 'constructor')
        const funcs = abi.filter(({ type, inputs }) => type === 'function' && !!inputs)
        const param = constructor ? encodeParam(constructor, i).toString('hex') : ''
        const rawTx1 = {
          nonce: `0x00`,
          gasPrice: '0x00',
          gasLimit: '0xffffffffffff',
          data: `0x${bin}${param}` 
        }   
        await setup({ keyPair, stateTrie })
        const watcher = analyzer.watch(deployCode)
        vm.on('step', state => watcher.onStep(state))
        const { createdAddress } = await runTx({ keyPair, vm, rawTx: rawTx1 })
        watcher.stop()
        vm.removeAllListeners()
        for (let j = 0; j < funcs.length; j++) {
          const rawTx2 = {
            nonce: `0x00`,
            gasPrice: '0x00',
            gasLimit: '0xffffffffffff',
            value: '0x00',
            to: `0x${createdAddress.toString('hex')}`,
            data: `0x${encodeParam(funcs[j], i).toString('hex')}` 
          }
          const watcher = analyzer.watch(createdCode)
          vm.on('step', (state) => watcher.onStep(state))
          await runTx({ keyPair, vm, rawTx: rawTx2 })
          watcher.stop()
          vm.removeAllListeners()
        }
        reporter.addAnalyzer(analyzer)
      }
      reporter.report()
    })
  })
}
