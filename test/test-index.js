const test = require("ava");
const Oreki = require("../index").Oreki;

function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()
    }, ms)
  })
}
test.serial("create Oreki object", t => {
  const oreki = new Oreki("./test/config-test-correct.json");
  if (oreki.config === null || oreki.config === undefined) {
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
    payment = await oreki.addPayment("user", "endpoint", 1, 1.5)
  } catch(err) {
    t.fail()
    return
  }
  if (payment === null) {
    t.fail()
    return
  }
  if (payment.address === null || payment.user_id !== "user" || payment.endpoint !== "endpoint" || payment.point !== 1 || payment.price !== 1.5 || payment.paid !== false) {
    t.fail()
    return
  }
  t.pass()
})


test.serial("check transaction", async function(t) {
  const alice = new Oreki("./test/config-alice.json")
  const bob = new Oreki("./test/config-bob.json")
  await bob.init()

  const payment = await bob.addPayment("user", "endpoint", 5, 1000)
  bob.on("paid", function(payment) {
    console.log("paid")
    if (payment === null) {
      t.fail()
      return
    }
    console.log("payment: ")
    console.log(payment)
    t.pass()
  })

  let response = null
  try {
    response = await alice.lightning.sendCoins(payment.address, 1000)
  } catch(err) {
    console.error(err)
    t.fail()
    return
  }

  await sleep(5 * 60 * 1000)
  try {
    await bob.checkTransaction()
  } catch(err) {
    console.error(err)
    t.fail()
  }
})
