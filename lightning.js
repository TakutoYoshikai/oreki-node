
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

module.exports = function(host, lndCertPath, macaroonPath) {
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
        walletUnlocker.unlockWallet(request, function(err, response) {
          if (err === null) {
            resolve()
            return
          }
          reject()
        })
      })
    },
    getBalance: function() {
      return new Promise(function(resolve, reject) {
        ln.walletBalance(request, function(err, response) {
          if (err === null && !response) {
            resolve(response)
            return
          }
          reject()
        });
      })
    }
  }
};
