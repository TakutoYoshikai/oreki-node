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
        await web3.eth.personal.unlockAccount(address, config.password, 1000)
      } catch(err) {
        console.error(err)
        throw err
      }
    },
    getBalance: async function(address) {
      let balance = null;
      try {
        balance = await web3.eth.getBalance(address);
      } catch(err) {
        throw err
      }
      return parseInt(balance);
    },
    moveCoins: async function(to) {
      for (let from of web3.eth.accounts) {
        try {
          await this.unlock(from);
        } catch (err) {
          console.error(err);
          throw err;
        }
        let balance = null;
        try {
          balance = await this.getBalance(from);
        } catch (err) {
          console.error(err);
          throw err;
        }
        let receipt = null;
        if (balance <= 100000000000000) {
          continue;
        }
        try {
          receipt = await this.sendCoins(from, to, balance - 100000000000000);
        } catch (err) {
          console.error(err);
          throw err;
        }
        console.log(receipt);
      }
    }
  }
}
