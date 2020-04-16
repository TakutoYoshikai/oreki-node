
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
    this.lightning = require("./lightning")(config.lnd);
    this.lightning.unlock().then(function() {
      console.log("unlocked")
    }).catch(function(err) {
      console.error(err)
    })
  }
  on(eventName, callback) {
    this.emitter.on(eventName, callback);
  }
  start() {
    if (this.timer === null) {
      const that = this
      this.timer = setInterval(function() {
        that.checkTransaction.apply(that)
      }, 60 * 1000)
    }
  }
  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer)
    }
  }

  async checkTransaction() {
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
    //TODO filtering checked transaction
    transactions.forEach(function(transaction) {
      const payment = payments.find(function(payment) {
        return payment.address === transaction.dest_addresses[0] || payment.address === transaction.dest_addresses[1]
      })
      if (payment === undefined) {
        return;
      }
      payment.paid = true
      payment.save()
      that.emitter.emit("paid", payment)
    })
  }
  async addPayment(userId, endpoint, point, price) {
    let address = null
    try {
      address = await this.lightning.createAddress()
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
        paid: false,
      })
    } catch(err) {
      console.error(err)
      return null
    }
    return payment
  }
}
