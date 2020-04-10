
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
    this.config = config;
    this.db = require("./db")()
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
  addPayment() {
    
  }
}
