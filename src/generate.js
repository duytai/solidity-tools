const fs = require('fs')
const shell = require('shelljs')
const { getType } = require('solidity-types')

module.exports = ({ buildPath, numTest }) => {
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
}
