const shell = require('shelljs')
const fs = require('fs')
const path = require('path')

module.exports = ({ solcPath, buildPath }) => {
  if (fs.existsSync(buildPath)) shell.rm('-r', buildPath)
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
}
