const shell = require('shelljs')
const fs = require('fs')
const { expect } = require('chai')

//it('download contracts', () => {
  //shell.cd('./env')
  //shell.exec('node ../index.js -d 10')
//})

it('compile', () => {
  shell.cd('./env')
  shell.exec('node ../index.js -c')
  const files = shell.ls('build/*.{abi,bin}')
  expect(files.length).gt(0)
  shell.cd('../')
})

it('generate', () => {
  shell.cd('./env')
  shell.exec('node ../index.js -g 100')
  const abiFiles = shell.ls('build/*.abi')
  abiFiles.forEach(file => {
    const abi = JSON.parse(fs.readFileSync(file, 'utf8'))
    abi.forEach(func => {
      const { inputs } = func
      inputs.forEach(({ name, type, values = [] }) => {
        expect(values.length).to.gt(0)
      })
    })
  })
  shell.cd('../')
})

it('execute', () => {
  shell.cd('./env')
  shell.exec('node ../index.js -e 1')
  shell.cd('../')
})
