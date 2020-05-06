
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
        if (this.config.coinType === "lightning") {
          that.checkLightningTransaction.apply(that)
        } else if (this.config.coinType === "ethereum") {
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
    try {
      transactions = await this.ethereum.getTransactions()
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
    for (let transaction of transactions) {
      const payment = payments.find(function(payment) {
        return (payment.address === transaction.to && payment.price <= parseInt(transaction.value))
      })
      if (payment === undefined) {
        return;
      }
      payment.paid = true
      payment.save()
      that.emitter.emit("paid", payment)
    }
  }
  async checkLightningTransaction() {
    let that = this
    let transactions = null
    try {
      transactions = await this.lightning.getTransactions()
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
      const txs = transactions.filter(function(tx) {
        return (tx.dest_addresses[0] === payment.address || tx.dest_addresses[1] === payment.address)
      })
      if (txs.length === 0) {
        return
      }
      remain = payment.price
      txs.forEach(function(tx) {
        remain -= tx.amount
      })
      if (payment.remain > remain && remain > 0) {
        payment.remain = remain
        payment.save
        this.emitter.emit("insufficient", payment)
        return
      }
      payment.remain = 0
      payment.paid = true
      payment.save()
      this.emitter.emit("paid", payment)
    })
  }
  async addPayment(userId, endpoint, point, price) {
    let address = null
    try {
      if (this.config.coinType === "lightning") {
        address = await this.lightning.createAddress()
      } else if (this.config.coinType === "ethereum") {
        address = await this.ethereum.createAddress()
      }
    } catch(err) {
      console.error(err)  
      return null
    }
    let payment = null
    try {
      payment = await this.db.createPayment({
        address: address,
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
