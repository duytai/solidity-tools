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
  report() {
    console.log('-------------------------------')
    console.log(`Contract: ${this.name}`)
    console.log('-------------------------------')
    console.log('| Lines   | Covers  | Coverag |')
    let finalLines = 0
    let finalCovers = 0
    this.analyzers.forEach(analyzer => {
      const { totalLines, totalCovers } = analyzer.getResult()
      console.log(`| ${pad(totalLines)} | ${pad(totalCovers)} | ${ pad(Math.round(100*totalCovers/totalLines)) } |`)
      finalLines += totalLines
      finalCovers += totalCovers
    })
    console.log('-------------------------------')
    console.log(`| Coverage: ${Math.round(100 * finalCovers / finalLines)} %`)
    console.log('-------------------------------')
  }
}

module.exports = Reporter
