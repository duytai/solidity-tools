const cheerio = require('cheerio')
const needle = require('needle')
const Q = require('q')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://etherscan.io/contractsVerified/' 
const BASE_CONTRACT_URL = 'https://etherscan.io/address/'
const PERPAGE = 25
const dataFromURL = (url) => {
  const { promise, resolve, reject } = Q.defer()
  needle.get(url, (error, result) => {
    if (error) return reject(error)
    resolve(result.body)
  })
  return promise
}
module.exports = async ({ buildPath, numContracts }) => {
  let contractCount = 0
  let curPage = 1
  while (contractCount < numContracts) {
    const URL = `${BASE_URL}${curPage}` 
    const body = await dataFromURL(URL)
    const $ = cheerio.load(body)
    const addrs = $('.address-tag').toArray()
    for (let i = 0; i < addrs.length; i++) {
      const addr = addrs[i]
      const { children } = addr
      const [ { data } ] = children 
      const CONTRACT_URL = `${BASE_CONTRACT_URL}${data}`
      const body = await dataFromURL(CONTRACT_URL)
      const $ = cheerio.load(body)
      const name = $('#ContentPlaceHolder1_contractCodeDiv tr')
        .eq(0)
        .find('td')
        .eq(1)
        .text()
        .replace(/\n/gi, '')
      const code = $('#editor').html()
      const abi = $('#js-copytextarea2').html().replace(/&quot;/g, '"')
      if (name && code) {
        console.log(`>> write ${name}_${data}.sol`)
        fs.writeFileSync(path.join(buildPath, '../', `${name}_${data}.sol`), code, 'utf8')
        contractCount++
        if (contractCount >= numContracts) {
          break
        }
      }
    }
    curPage++
  }
}
