const express = require("express")
const app = express()
const Oreki = require("./index").Oreki
const bodyParser = require("body-parser")
module.exports = function(configPath) {
  const oreki = new Oreki(configPath)

  app.use(bodyParser.urlencoded({
    extended: true
  }))

  app.use(bodyParser.json())

  let paymentBuffer = []

  app.post("/", function(req, res, next) {
    const password = req.body.password
    if (password !== oreki.config.password) {
      res.status(403).json({ msg: "forbidden" })
      return
    }
    res.json({ payments: paymentBuffer })
    paymentBuffer = []
  })

  app.post("/payment", function(req, res, next) {
    const userId = req.body.user_id
    const endpointId = req.body.endpoint
    const point = req.body.point
    const price = req.body.price
    const password = req.body.password
    if (password !== oreki.config.password) {
      res.status(403).json({ msg: "forbidden" })
      return
    }
    oreki.addPayment(userId, endpointId, point, price).then(function(payment) {
      res.json({
        payment: payment
      })
    }).catch(function(err) {
      res.status(500).json(err)
    })
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
}
