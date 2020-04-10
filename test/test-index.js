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
  const oreki = new Oreki("./test/config-test-correct.json");
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
  if (payment.address === null || payment.user_id !== "user" || payment.endpoint !== "endpoint" || payment.point !== 1 || payment.price !== 1.5) {
    t.fail()
    return
  }
  t.pass()
})
