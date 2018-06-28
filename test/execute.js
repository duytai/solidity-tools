const shell = require('shelljs')
const fs = require('fs')
const { expect } = require('chai')

it('execute', () => {
  shell.cd('./env')
  shell.exec('node ../index.js -e 1')
})
