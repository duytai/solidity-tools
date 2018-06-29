const path = require('path')
const shell = require('shelljs')
const fs = require('fs')
const rimraf = require('rimraf')

const safeRemoveExtension = (p, ext) => {
  fs.readdir(p, (error, result) => {
    if (!error) {
      result.forEach(r => {
        if (new RegExp(`\.${ext}$`, 'gi').test(r)) fs.unlinkSync(r)
      })
    }
  })
}
const safeRemovePath = (f) => {
  if (fs.existsSync(f)) rimraf(f, () => {}) 
}
module.exports = ({ buildPath }) => {
  const homeDirectory = path.join(buildPath, '../')
  const configPath = path.join(homeDirectory, 'contracts.config')
  safeRemovePath(configPath)
  safeRemoveExtension(homeDirectory, '.sol')
  safeRemovePath(buildPath)
}
