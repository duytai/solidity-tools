const shell = require('shelljs')
const fs = require('fs')

module.exports = ({ solcPath, buildPath }) => {
  if (fs.existsSync(buildPath)) shell.rm('-r', buildPath)
  shell.mkdir(buildPath)
  shell.exec(`${solcPath} --abi --bin *.sol -o build`)
}
