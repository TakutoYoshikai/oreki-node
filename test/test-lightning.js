const test = require("ava");
const fs = require("fs")
const lndConfig = JSON.parse(fs.readFileSync("./test/config-test-correct.json", "utf-8")).lnd
const lightning = require("../lightning")(lndConfig)

function unlock() {
  return new Promise(function(resolve, reject) {
    lightning.unlock().then(function() {
      setTimeout(resolve, 3000)
    }).catch(function() {
      resolve()
    })
  })
}

function executeTest() {
  test.serial("get balance", async function (t){
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

  test.serial("get transaction", async function(t) {
    let transactions
    try {
      transactions = await lightning.getTransactions()
    } catch(err) {
      t.fail()
      return
    }
    if (Array.isArray(transactions)) {
      t.pass()
      return
    }
    t.fail()
  })

  test.serial("add invoice", async function(t) {
    let request
    try {
      request = await lightning.addInvoice(1000)
    } catch(err) {
      console.error(err)
      t.fail()
      return
    }
    if ((typeof request === "string" || request instanceof String) && request.length > 0) {
      t.pass()
      return
    }
    t.fail()
  })

  test.serial("create new address", async function(t) {
    let address
    try {
      address = await lightning.createAddress()
    } catch(err) {
      console.error(err)
      t.fail()
      return
    }
    if ((typeof address === "string" || address instanceof String) 
      && address.length > 0) {
      t.pass()
      return
    }
    t.fail()
  })
}

unlock().then(function() {
  executeTest()
})
