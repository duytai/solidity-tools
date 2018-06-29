#!/usr/bin/env node
require('colors')
const shell = require('shelljs')
const program = require('commander')
const fs = require('fs')
const path = require('path')
const { 
  compile, 
  generate, 
  execute, 
  download,
  reset,
} = require('./src')

const homePath = shell.pwd().toString()
const solcPath = path.join(__dirname, 'node_modules/.bin/solcjs')
const buildPath = path.join(homePath, './build')
program
  .version('0.0.1')
  .option('-c, --compile', 'compile contracts')
  .option('-g, --generate <numTest>', 'generate testcases')
  .option('-e, --execute <numTest>', 'execute program with generated testcases')
  .option('-d, --download <numContract>', 'download contracts from etherscan.io')
  .option('-r, --reset', 'remove all files')
  .parse(process.argv)
switch (true) {
  case !!program.compile: {
    compile({ solcPath, buildPath })
    break
  }
  case !!program.generate: {
    const numTest = parseInt(program.generate)
    generate({ buildPath, numTest })
    break
  }
  case !!program.execute: {
    const numTest = parseInt(program.execute)
    execute({ buildPath, numTest })
    break
  }
  case !!program.download: {
    const numContracts = parseInt(program.download)
    download({ buildPath, numContracts })
    break
  }
  case !!program.reset: {
    reset({ buildPath })
    break
  }
  default: {
    console.log(`${'\u2620'.red} unknown parameters`)
    process.exit()
  }
}
