const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const rimraf = require('rimraf')

const safeRemovePath = (f) => {
  if (fs.existsSync(f)) rimraf(f, () => {}) 
}
module.exports = ({ solcPath, buildPath }) => {
  fs.readdir(shell.pwd().toString(), (_, files) => {
    const solFiles = files.filter(f => /\.sol$/.test(f))
    expect(solFiles.length).gte(1)
    safeRemovePath(buildPath)
    shell.mkdir(buildPath)
    shell.exec(`${solcPath} --abi --bin *.sol -o build`)
    const configPath = path.join(buildPath, '../contracts.config')
    if (fs.existsSync(configPath)) {
      const { contracts } = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      const validFilenames = contracts.map(({ name, addr }) => `${name}_${addr}_sol_${name}`)
      const filenames = shell.ls(buildPath)
      filenames.forEach(filename => {
        if (!validFilenames.includes(filename.slice(0, -4))) shell.rm(path.join(buildPath, filename))
      })
    } 
    fs.readdir(buildPath, (_, files) => {
      expect(files.length).gt(0)
    })
  })
}
