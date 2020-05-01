const Web3 = require("web3")


module.exports = function(config) {
  const web3 = new Web3(config.wsHost)
  return {
    getTransactions: async function() {
      let block = null
      try {
        block = await web3.eth.getBlock("latest")
      } catch(err) {
        console.error(err)
        throw err
      }
      let transactions = []
      for (let transactionHash of block.transactions) {
        let transaction = null
        try {
          transaction = await web3.eth.getTransaction(transactionHash)
        } catch(err) {
          console.error(err)
          throw err
        }
        transactions.push(transaction)
      }
      return transactions
    },
    sendCoins: async function(from, to, amount) {
      let receipt = null
      try {
        receipt = await web3.eth.sendTransaction({
          from: from,
          to: to,
          value: amount
        })
      } catch(err) {
        console.error(err)
        throw err
      }
      return receipt
    },
    createAddress: async function() {
      let address = null
      try {
        address = await web3.eth.personal.newAccount(config.password)
      } catch(err) {
        console.error(err)
        throw err
      }
      return address
    },
    unlock: async function(address) {
      try {
        await web3.eth.personal.unlockAccount(address, config.password, 300)
      } catch(err) {
        console.error(err)
        throw err
      }
    }
  }
}
