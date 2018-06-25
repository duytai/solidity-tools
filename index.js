const shell = require('shelljs')
const program = require('commander')
const fs = require('fs')
const path = require('path')
const { compile, generate } = require('./src')

const solcPath = path.join(__dirname, 'node_modules/.bin/solcjs')
const buildPath = path.join(shell.pwd().toString(), './build')
program
  .version('0.0.1')
  .option('-c, --compile', 'compile contracts')
  .option('-g, --generate <numTest>', 'generate testcase')
  .parse(process.argv)

switch (true) {
  case !!program.compile: {
    compile({ solcPath, buildPath })
    break
  }
  case !!program.generate: {
    const numTest = parseInt(program.generate)
    if (!fs.existsSync(buildPath)) compile({ solcPath, buildPath })
    generate({ buildPath, numTest })
    break
  }
  default: {
    console.log('>> unknown parameters')
    process.exit()
  }
}
