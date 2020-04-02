/*
var grpc = require('grpc');
var fs = require("fs");

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'

var lndCert = fs.readFileSync("~/.lnd/tls.cert");
var credentials = grpc.credentials.createSsl(lndCert);
var lnrpcDescriptor = grpc.load("rpc.proto");
var lnrpc = lnrpcDescriptor.lnrpc;
var lightning = new lnrpc.Lightning('localhost:10009', credentials);
*/

const fs = require("fs");

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
    const databases = [
      "sequelize"
    ];
    if (config.database === null || config.database === undefined) {
      throw new Error("database is not set in config.");
    }
    if (!databases.includes(config.database)) {
      throw new Error("database in config is not supported.");    
    }
    return true;
  }
  constructor(configPath) {
    const config = this.loadConfig(configPath);
    if (!this.validateConfig(config)) {
      return;
    }
    this.config = config;
  }
}
