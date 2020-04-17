const express = require("express")
const app = express()
const Oreki = require("./index").Oreki
const oreki = new Oreki("config.json")

let paymentBuffer = []

app.get("/", function(req, res, next) {
  res.json({ payments: paymentBuffer })
  paymentBuffer = []
})

app.listen(3000, function() {
  console.log("oreki started")
});

(async() => {
  const initialized = await oreki.init()
  if (!initialized) {
    console.error("couldn't initialized")
    return
  }
  oreki.on("paid", function(payment) {
    console.log("PAID")
    console.log(payment)
    paymentBuffer.push(payment)
  })
  oreki.start()
  let payment = await oreki.addPayment("user", "endpoint", 5, 1000)
  console.log(payment.address)
})()
