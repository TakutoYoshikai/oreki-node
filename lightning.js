
var grpc = require("grpc");
var fs = require("fs");
var protoLoader = require("@grpc/proto-loader");
// Suggested options for similarity to existing grpc.load behavior
var packageDefinition = protoLoader.loadSync("rpc.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// The protoDescriptor object has the full package hierarchy
var lnrpc = protoDescriptor.lnrpc;

module.exports = function(config) {
  const host = config.host
  const lndCertPath = config.lndCert
  const macaroonPath = config.macaroon 
  const password = config.password
  var macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(
        args,
        callback
        ) {
    var macaroon = fs.readFileSync(macaroonPath).toString("hex");
    var metadata = new grpc.Metadata();
    metadata.add("macaroon", macaroon);
    callback(null, metadata);
  });

  var lndCert = fs.readFileSync(lndCertPath);
  var sslCreds = grpc.credentials.createSsl(lndCert);
  var walletUnlocker = new lnrpc.WalletUnlocker(host, sslCreds);
  var creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
  var ln = new lnrpc.Lightning(host, creds);

  return {
    unlock: function() {
      return new Promise(function(resolve, reject) {
        const request = {
          wallet_password: Buffer.from(password)
        }
        walletUnlocker.unlockWallet(request, function(err, response) {
          if (err === null) {
            setTimeout(resolve, 3000)
            return
          }
          reject(err)
        })
      })
    },
    getTransactions:function() {
      return new Promise(function(resolve, reject) {
        const request = {}
        ln.getTransactions(request, function(err, response) {
          if (err !== null) {
            reject(err)
            return
          }
          if (!response.transactions) {
            reject()
            return
          }
          resolve(response.transactions)
        });
      })
    },
    getBalance: function() {
      return new Promise(function(resolve, reject) {
        const request = {}
        ln.walletBalance(request, function(err, response) {
          if (err === null && response.total_balance !== undefined) {
            resolve(response)
            return
          }
          reject()
        });
      })
    },
    createAddress: function() {
      return new Promise(function(resolve, reject) {
        const request = {
          type: "np2wkh"
        }
        ln.newAddress(request, function(err, response) {
          if (err !== null) {
            reject(err)
            return
          }
          if (!response || response.address === undefined) {
            reject()
            return
          }
          resolve(response.address)
        })
      })
    }
  }
};
