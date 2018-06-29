const opcodes = require('./opcodes')

const buildAddressCounter = (bytecode) => {
  const address = {} 
  const code = Buffer.from(bytecode, 'hex')
  for (let i = 0; i < code.length; i++) {
    const pc = i
    const curOpCode = opcodes(code[pc], true).name
    address[i] = 0
    if (curOpCode.slice(0, 4) === 'PUSH') {
      const jumpNum = code[pc] - 0x5f
      i += jumpNum
    }
  }
  return address
}

class Analyzer {
  constructor() {
    this.counters = []
  }
  watcher () {
    let addressCounter = {}
    return {
      onStep: state => {
        if (!addressCounter[state.pc]) {
          addressCounter[state.pc] = 0
        }
        addressCounter[state.pc]++
      },
      stop: (code) => {
        addressCounter = Object.assign(buildAddressCounter(code), addressCounter)
        this.counters.push(addressCounter)
      },
    }
  }
  getResult() {
    let totalLines = 0
    let totalCovers = 0
    this.counters.forEach(counter => {
      const numLines = Object.keys(counter).length
      const numCovers = Object.values(counter).filter(i => i > 0).length
      totalLines += numLines
      totalCovers += numCovers
    })
    return { 
      totalLines, 
      totalCovers,
    }
  }
}

module.exports = Analyzer
