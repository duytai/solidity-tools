const fs = require('fs')
const shell = require('shelljs')
const { getType } = require('solidity-types')
const { expect } = require('chai')

module.exports = ({ buildPath, numTest }) => {
  fs.readdir(buildPath, (_, files = []) => {
    const abis = files.filter(f => /\.abi$/.test(f))
    expect(abis.length).gte(1)
    const abiFiles = shell.ls(`${buildPath}/*.abi`)
    abiFiles.forEach(abiFile => {
      const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8')) 
      abi.forEach(func => {
        if (!func.inputs) return
        func.inputs.forEach((input) => {
          const { type } = input
          const t = getType(type)
          const values = [...Array(numTest)].map(_ => t.random())
          input.values = values
        })
      })
      fs.writeFileSync(abiFile, JSON.stringify(abi), 'utf8')
    })
  })
}
