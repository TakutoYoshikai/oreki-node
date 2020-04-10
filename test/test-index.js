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
