const cheerio = require('cheerio')
const needle = require('needle')
const Q = require('q')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const { expect } = require('chai')

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
  const configPath = path.join(buildPath, '../', 'contracts.config')
  let contractCount = 0
  let curPage = 1
  let config = {
    contracts: [] 
  }
  const configExists = fs.existsSync(configPath)
  if (configExists) {
    config = JSON.parse(fs.readFileSync(configPath), 'utf8')
  }
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
      const code = $('#editor')
        .text()
        .replace(/\d+\.\d+\.\d+/, '0.4.24')
      const abi = $('#js-copytextarea2').text().replace(/&quot;/g, '"')
      if (name && code) {
        console.log(`${'\u2713'.green} ${name}_${data}.sol`)
        fs.writeFileSync(path.join(buildPath, '../', `${name}_${data}.sol`), code, 'utf8')
        if (!config.contracts.map(({ addr }) => addr).includes(data)) {
          config.contracts.push({
            name,
            addr: data,
          })
        }
        contractCount++
        if (contractCount >= numContracts) {
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
          console.log(`${'\u2713'.green} contracts.config`)
          break
        }
      }
    }
    curPage++
  }
  expect(fs.existsSync(configPath)).to.equal(true)
  fs.readdir(shell.pwd().toString(), (error, files) => {
    const solFiles = files.filter(f => /\.sol$/.test(f))
    expect(solFiles.length).gte(numContracts)
  })
}
