const test = require("ava");
const request = require("request-promise")

function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()
    }, ms)
  })
}

test.serial("add payment", async function(t) {
  (async() => {
    require("../server")("./test/config-alice.json")
  })()
  await sleep(3000)
  const options = {
    url: "http://localhost:3000/payment",
    method: "POST",
    json: true,
    headers: {
      "Content-Type": "application/json"
    },
    json: {
      user_id: "user",
      endpoint: "/endpoint",
      point: 10,
      price: 100
    }
  }

  let body = null
  try {
    body = await request.post(options)
  } catch(err) {
    t.fail(err)
    return
  }
  if (body.user_id !== "user" || body.endpoint !== "/endpoint" || body.point !== 10 || body.price !== 100) {
    t.fail()
    return
  }
  t.pass()
})
