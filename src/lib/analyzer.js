module.exports = (state) => {
  const { opcode: { name }, pc, stack } = state
  //console.log(state.callData)
  //console.log(stack.map(elem => elem.toString('hex')))
  console.log(`>> 0x${pc.toString(16)} ${name}`)
}
