const Q = require('q')
const Transaction = require('ethereumjs-tx')

module.exports = ({ keyPair, rawTx, vm }) => {
  const { promise, resolve, reject } = Q.defer()
  const tx = new Transaction(rawTx)
  tx.sign(Buffer.from(keyPair.secretKey, 'hex'))
  vm.runTx({ tx, skipNonce: true }, (error, result) => {
    if (error) return reject(error)
    resolve(result)
  })
  return promise
}
