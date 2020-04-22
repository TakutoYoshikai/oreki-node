const test = require("ava");
const request = require("request-promise")

function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()
    }, ms)
  })
}
(async() => {
  require("../server")("./test/config-alice.json")
})()

test.serial("add payment", async function(t) {
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
      price: 100,
      password: "password"
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
test.serial("add payment by wrong password", async function(t) {
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
      price: 100,
      password: "wrong"
    }
  }

  let body = null
  try {
    body = await request.post(options)
  } catch(err) {
    if (err.statusCode === 403) {
      t.pass()
      return
    }
    t.fail(err)
    return
  }
  t.fail()
})

test.serial("get buffer payment", async function(t) {
  await sleep(3000)
  const options = {
    url: "http://localhost:3000/",
    method: "POST",
    json: true,
    headers: {
      "Content-Type": "application/json"
    },
    json: {
      password: "password"
    }
  }

  let body = null
  try {
    body = await request.post(options)
  } catch(err) {
    t.fail(err)
    return
  }
  t.pass()
})
test.serial("get buffer payment", async function(t) {
  await sleep(3000)
  const options = {
    url: "http://localhost:3000/",
    method: "POST",
    json: true,
    headers: {
      "Content-Type": "application/json"
    },
    json: {
      password: "wrong"
    }
  }

  let body = null
  try {
    body = await request.post(options)
  } catch(err) {
    if (err.statusCode === 403) {
      t.pass()
      return
    }
    t.fail(err)
    return
  }
  t.fail()
})
