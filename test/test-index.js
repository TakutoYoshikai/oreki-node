const test = require("ava");
const Oreki = require("../index").Oreki;
test("create Oreki object", t => {
  const oreki = new Oreki("./test/config-test-correct.json");
  if (oreki.config === null || oreki.config === undefined) {
    t.fail();
    return;
  }
  t.pass();
});

test("event emitter", t => {
  const oreki = new Oreki("./test/config-test-correct.json");
  oreki.on("start", function() {
    t.pass();
  });
  oreki.emitter.emit("start");
});

test("add payment", async function (t) {
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

test("send coin", async function(t) {
  const alice = new Oreki("./test/config-alice.json")
  const bob = new Oreki("./test/config-bob.json")
  let address = null
  try {
    address = await bob.lightning.createAddress()
  } catch(err) {
    console.error(err)
    t.fail()
    return
  }
  let response = null
  try {
    response = await alice.lightning.sendCoins(address, 1000)
  } catch(err) {
    console.error(err)
    t.fail()
    return
  }
  console.log("RESPONSE")
  console.log(response)
  t.pass()
})

test("check transaction", async function(t) {
/*
  const alice = new Oreki("./test/config-alice.json")
  const bob = new Oreki("./test/config-bob.json")
  alice.

  await oreki.addPayment("user", "endpoint", 5, 1)
  oreki.on("paid", function(payment) {
    console.log("paid")
    if (payment === null) {
      t.fail()
      return
    }
    console.log("payment: ")
    console.log(payment)
    t.pass()
  })
  try {
    await oreki.checkTransaction()
  } catch(err) {
    t.fail()
    return
  }
*/
})
