const encoder = require('ethereumjs-abi')

module.exports = (func, testIndex) => {
  const { name = '', inputs } = func 
  const methodId = name ? encoder.methodID(name, inputs.map(({ type }) => type)) : Buffer.from([]) 
  const methodData = encoder.rawEncode(
    inputs.map(({ type }) => type), 
    inputs.map(({ values }) => values[testIndex]))
  return Buffer.concat([ methodId, methodData ]).toString('hex')
} 
