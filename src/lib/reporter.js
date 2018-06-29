const fs = require('fs')

const pad = (number, size = 7) =>  {
  let s = String(number) 
  while (s.length < size) {
    s = ' ' + s
  }
  return s
}

class Reporter {
  constructor(name = '') {
    this.name = name
    this.analyzers = []
  }
  addAnalyzer(analyzer) {
    this.analyzers.push(analyzer) 
  }
  report({ file }) {
    const log = fs.createWriteStream(file, { flags: 'a' })
    console.log(`${'\u2669'.green} ${this.name}`)
    log.write('-------------------------------\n')
    log.write(`Contract: ${this.name}\n`)
    log.write('-------------------------------\n')
    log.write('| Lines   | Covers  | Coverag |\n')
    let finalLines = 0
    let finalCovers = 0
    this.analyzers.forEach(analyzer => {
      const { totalLines, totalCovers } = analyzer.getResult()
      log.write(`| ${pad(totalLines)} | ${pad(totalCovers)} | ${ pad(Math.round(100*totalCovers/totalLines)) } |\n`)
      finalLines += totalLines
      finalCovers += totalCovers
    })
    log.write('-------------------------------\n')
    log.write(`| Coverage: ${Math.round(100 * finalCovers / finalLines)} % \n`)
    console.log(`${'\u0023'.grey} ${finalCovers} | ${finalLines} | ${Math.round(100 * finalCovers / finalLines)} %`)
    log.write('-------------------------------\n')
    log.end()
  }
}

module.exports = Reporter
