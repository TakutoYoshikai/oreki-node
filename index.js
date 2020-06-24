
const fs = require("fs");
const EventEmitter = require("events");

exports.hello = function() {
  console.log("hello world!");
}

exports.Oreki = class {
  loadConfig(configPath) {
    const jsonText = fs.readFileSync(configPath, {
      encoding: "utf-8"
    });
    const json = JSON.parse(jsonText);
    return json;
  }
  validateConfig(config) {
    return true;
  }
  constructor(configPath) {
    this.emitter = new EventEmitter();
    const config = this.loadConfig(configPath);
    if (!this.validateConfig(config)) {
      return;
    }
    this.config = config
    this.timer = null
    this.db = require("./db")(config.db)
    if (this.config.coinType === "lightning") {
      this.lightning = require("./lightning")(config.lnd)
    }
    if (this.config.coinType === "ethereum") {
      this.ethereum = require("./ethereum")(config.geth)
    }
  }
  on(eventName, callback) {
    this.emitter.on(eventName, callback);
  }
  async init() {
    if (this.config.coinType === "lightning") {
      try {
        await this.lightning.unlock()
      } catch(err) {
        console.error(err)
      }
    }
    try {
      await this.db.initDB()
    } catch(err) {
      console.error(err)
      return false
    }
    return true
  }
  start() {
    if (this.timer === null) {
      const that = this
      this.timer = setInterval(function() {
        if (that.config.coinType === "lightning") {
          that.checkLightningTransaction.apply(that)
        } else if (that.config.coinType === "ethereum") {
          that.checkEthereumTransaction.apply(that)
        }
      }, 60 * 1000)
    }
  }
  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer)
    }
  }
  async checkEthereumTransaction() {
    let payments = null
    try {
      payments = await this.db.getPayments()
    } catch(err) {
      console.error(err)
      return
    }
    for (let payment of payments) {
      await this.ethereum.unlock(payment.payee)
      const balance = await this.ethereum.getBalance(payment.payee)
      if (payment.price > balance) {
        payment.remain = payment.price - balance
        payment.save
        this.emitter.emit("insufficient", payment)
        continue
      }
      payment.remain = 0
      payment.paid = true
      payment.save()
      this.emitter.emit("paid", payment)
    }
  }
  async checkLightningTransaction() {
    let that = this
    let invoices = null
    try {
      invoices = await this.lightning.listInvoices()
    } catch(err) {
      console.error(err)
      return
    }
    let payments = null
    try {
      payments = await this.db.getPayments()
    } catch(err) {
      console.error(err)
      return
    }
    payments.forEach(function(payment) {
      const _invoices = invoices.filter(function(invoice) {
        return invoice.payment_request === payment.payee
      })
      if (_invoices.length === 0) {
        return
      }
      payment.remain = 0
      payment.paid = true
      payment.save()
      that.emitter.emit("paid", payment)
    })
  }
  async addPayment(userId, endpoint, point, price) {
    let payee = null
    try {
      if (this.config.coinType === "lightning") {
        payee = await this.lightning.addInvoice(price)
      } else if (this.config.coinType === "ethereum") {
        payee = await this.ethereum.createAddress()
      }
    } catch(err) {
      console.error(err)  
      return null
    }
    let payment = null
    try {
      payment = await this.db.createPayment({
        payee: payee,
        user_id: userId,
        endpoint: endpoint,
        point: point,
        price: price,
        remain: price,
        paid: false,
      })
    } catch(err) {
      console.error(err)
      return null
    }
    return payment
  }
}
