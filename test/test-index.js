const test = require("ava");
const Oreki = require("../index").Oreki;
test("create Oreki object", t => {
  const oreki = new Oreki("./test/config-test-correct.json");
  if (oreki.config === null || oreki.config === undefined) {
    t.fail();
    return;
  }
  if (oreki.config.database !== "sequelize") {
    t.fail();
    return;
  }
  t.pass();
});

test("failing Oreki creation", t => {
  try {
    const oreki = new Oreki("./test/config-test-wrong.json");
  } catch (e) {
    t.pass();
    return;
  }
  t.fail();
});
