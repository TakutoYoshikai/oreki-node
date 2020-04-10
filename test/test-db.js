const test = require("ava");
const Payment = require("../db")({
  sqliteFile: "test.sqlite3",
  test: true
})

test("create payment and get payment", async function(t) {
  await Payment.initDB()
  let payment = null
  try {
    payment = await Payment.createPayment({
      address: "address",
      user_id: "user_id",
      endpoint: "endpoint",
      point: 5,
      price: 1.5
    })
  } catch(err) {
    t.fail(err)
    return
  }
  if (!(payment.address === "address" && payment.user_id === "user_id" && payment.endpoint === "endpoint" && payment.point === 5 && payment.price === 1.5)) {
    t.fail()
    return
  }
  try {
    payment = await Payment.getPaymentByAddress("address")
  } catch(err) {
    t.fail(err)
    return
  }
  if (payment.address !== "address") {
    t.fail()
    return
  }

  let payments = null
  try {
    payments = await Payment.getPayments()
  } catch(err) {
    t.fail(err)
    return
  }
  if (!(payments.length === 1 && payments[0].address === "address")) {
    t.fail()
    return
  }
  t.pass()
})
