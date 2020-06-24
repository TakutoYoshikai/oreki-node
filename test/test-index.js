const test = require("ava")
const Oreki = require("../index").Oreki
const msToWaitBlock = 1000 * 60 * 10

function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()
    }, ms)
  })
}
test.serial("create Oreki object", t => {
  const oreki = new Oreki("./test/config-test-correct.json");
  if (oreki.config === null 
    || oreki.config === undefined) {
    t.fail();
    return;
  }
  t.pass();
});

test.serial("event emitter", t => {
  const oreki = new Oreki("./test/config-test-correct.json");
  oreki.on("start", function() {
    t.pass();
  });
  oreki.emitter.emit("start");
});

test.serial("add payment", async function (t) {
  const oreki = new Oreki("./test/config-test-correct.json")
  let payment = null
  try {
    payment = await oreki.addPayment("user", "endpoint", 1, 3)
  } catch(err) {
    t.fail()
    return
  }
  if (payment === null 
    || payment === undefined) {
    t.fail()
    return
  }
  if (payment.payee === null 
    || payment.payee === undefined
    || payment.user_id !== "user" 
    || payment.endpoint !== "endpoint" 
    || payment.point !== 1 
    || payment.price !== 3 
    || payment.paid !== false) {
    t.fail()
    return
  }
  t.pass()
})

test.serial("check transaction", async function(t) {
  const alice = new Oreki("./test/config-alice.json")
  const bob = new Oreki("./test/config-bob.json")
  let insufficientCheck = false
  await bob.init()

  const payment = await bob.addPayment("user", "endpoint", 5, 2000)
  bob.on("paid", function(payment) {
    console.log("paid")
    if (payment === null
      || payment === undefined) {
      t.fail()
      return
    }
    console.log("payment: ")
    console.log(payment)
    if (insufficientCheck) {
      t.pass()
    }
  })

  bob.on("insufficient", function(_payment) {
    if (payment.id === _payment.id
      && _payment.paid === false) {
      insufficientCheck = true   
    }
  })

  let response = null
  try {
    response = await alice.lightning.sendCoins(payment.payee, 1000)
  } catch(err) {
    console.error(err)
    t.fail()
    return
  }

  await sleep(msToWaitBlock)
  try {
    await bob.checkLightningTransaction()
  } catch(err) {
    console.error(err)
    t.fail()
  }

  try {
    response = await alice.lightning.sendCoins(payment.payee, 1000)
  } catch(err) {
    console.error(err)
    t.fail()
    return
  }

  await sleep(msToWaitBlock)
  try {
    await bob.checkLightningTransaction()
  } catch(err) {
    console.error(err)
    t.fail()
  }
})

test.serial("ethereum transaction check", async function(t) {
  const oreki = new Oreki("./test/config-eth-alice.json")
  await oreki.init()
  oreki.ethereum.unlock(oreki.config.geth.test.fromAddress)
  const payment = await oreki.addPayment("user", "endpoint", 10, 1000000)
  let insufficientCheck = false;
  oreki.on("paid", function(payment) {
    console.log("paid")
    if (payment === null
      || payment === undefined) {
      t.fail()
      return
    }
    console.log("payment: ")
    console.log(payment)
    if (!insufficientCheck) {
      t.fail()
      return
    }
    t.pass()
  })
  oreki.on("insufficient", function(_payment) {
    console.log("insufficient")
    if (payment.payee === _payment.payee) {
      insufficientCheck = true;
    }
  });
  let receipt = await oreki.ethereum.sendCoins(oreki.config.geth.test.fromAddress, payment.payee, 500000)
  if (receipt === null || receipt === undefined) {
    t.fail()
    return
  }
  await sleep(4 * 60 * 1000)
  try {
    await oreki.checkEthereumTransaction()
  } catch(err) {
    console.error(err)
    t.fail()
  }
  receipt = await oreki.ethereum.sendCoins(oreki.config.geth.test.fromAddress, payment.payee, 500000)
  if (receipt === null || receipt === undefined) {
    t.fail()
    return
  }
  await sleep(4 * 60 * 1000)
  try {
    await oreki.checkEthereumTransaction()
  } catch(err) {
    console.error(err)
    t.fail()
  }
})
