const Account = require('ethereumjs-account')
const Q = require('q')
const utils = require('ethereumjs-util')

module.exports = async ({ keyPair, stateTrie }) => {
  const { promise, resolve, reject } = Q.defer()
  const publicKeyBuf = Buffer.from(keyPair.publicKey, 'hex')
  const address = utils.pubToAddress(publicKeyBuf, true)
  const account = new Account()
  account.balance = '0xf00000000000000001'
  stateTrie.put(address, account.serialize(), (error, result) => {
    if (error) return reject(error)
    resolve(result)
  })
  return promise
}

