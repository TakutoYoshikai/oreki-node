
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
    (async() => {
      try {
        await this.lightning.unlock()
      } catch(err) {
        console.error(err)
        return
      }
    })()
  }
  on(eventName, callback) {
    this.emitter.on(eventName, callback);
  }
  start() {
    if (this.timer === null) {
      this.timer = setInterval(this.checkTransaction, 60 * 1000)
    }
  }
  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer)
    }
  }

  async checkTransaction() {
    let transactions = null
    try {
      transactions = await this.lightning.getTransactions()
    } catch(err) {
      console.error(err)
      return
    }
  }
  async addPayment(userId, endpoint, point, price) {
    let address = null
    try {
      address = await this.lightning.createAddress()
    } catch(err) {
      console.log(err)  
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
      console.log(err)
      return null
    }
    return payment
  }
}
