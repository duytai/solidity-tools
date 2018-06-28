module.exports = (bytecode) => {
  const code = Buffer.from(bytecode, 'hex') 
  const splitIndex = []
  for (let i = 0; i < code.length - 1; i++) {
    const sign = code.slice(i, i + 2).toString('hex')
    if (sign === 'f300') splitIndex.push(i + 2)
  }
  if (splitIndex.length >= 2) throw new Error(`Split wrong position ${splitIndex}`)
  return {
    deployCode: code.slice(0, splitIndex[0]).toString('hex'),
    createdCode: code.slice(splitIndex[0]).toString('hex'),
  }
}
