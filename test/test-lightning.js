const test = require("ava");
const fs = require("fs")
const lndConfig = JSON.parse(fs.readFileSync("./test/config-test-correct.json", "utf-8")).lnd
const lightning = require("../lightning")(lndConfig)

function sleep(waitSec) {
  return new Promise(function (resolve) {
    setTimeout(function() { resolve() }, waitSec);
  });
}

(function unlock() {
  return new Promise(async function(resolve, reject) {
    try {
      await lightning.unlock()
    } catch(err) {
      console.error(err);
    }
    await sleep(3000)
    resolve()
  })
})()


test("get balance", async function (t){
  let success = true;
  try {
    const response = await lightning.getBalance()
  } catch(err) {
    console.error(err);
    success = false
  }
  if (success) {
    t.pass()
    return
  }
  t.fail()
})

test("get transaction", async function(t) {
  let transactions
  try {
    transactions = await lightning.getTransactions()
  } catch(err) {
    t.fail()
    return
  }
  console.log(transactions)
  if (transactions.length >= 0) {
    t.pass()
    return
  }
  t.fail()
})
