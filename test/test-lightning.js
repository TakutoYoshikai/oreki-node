const test = require("ava");
const fs = require("fs")
const lndConfig = JSON.parse(fs.readFileSync("./test/config-test-correct.json", "utf-8")).lnd
const lightning = require("../lightning")(lndConfig)

function sleep(waitSec) {
  return new Promise(function (resolve) {
    setTimeout(function() { resolve() }, waitSec);
  });
}
test("unlock and get balance", async function (t){
  let success = true;
  try {
    await lightning.unlock()
  } catch(err) {
    console.error(err);
    success = false
  }
  await sleep(3000)
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
