const test = require("ava")
const Ethereum = require("../ethereum")
const config = {
  wsHost: "ws://localhost:8546",
  password: "HelloWorld"
}

test.serial("get transaction", async function(t) {
  const ethereum = new Ethereum(config)
  const transactions = await ethereum.getTransactions()
  if (Array.isArray(transactions)) {
    console.log(transactions)
    t.pass()
    return
  }
  t.fail()
})

let address1 = null
test.serial("new account", async function(t) {
  const ethereum = new Ethereum(config)
  const address = await ethereum.createAddress()
  if (
    (typeof(address) == "string" || address instanceof String)
    && address.length > 0) {
    address1 = address
    t.pass()
    return
  }
  t.fail()
})

test.serial("unlock", async function(t) {
  const ethereum = new Ethereum(config)
  try {
    ethereum.unlock(address1)
  } catch(err) {
    t.fail()
    return
  }
  t.pass()
})

test.serial("get balance", async function(t) {
  const ethereum = new Ethereum(config)
  try {
    await ethereum.unlock(address1)
  } catch(err) {}

  let balance = null;
  try {
    balance = await ethereum.getBalance(address1)
  } catch (err) {
    t.fail(err)
  }
  if (balance !== 0) {
    t.fail()
  }
  t.pass()

});
