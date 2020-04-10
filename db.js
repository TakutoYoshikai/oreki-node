const Sequelize = require("sequelize")

module.exports = function(config) {
  let sqliteFile = "payment.sqlite3"
  let test = false
  if (config !== undefined) {
    if (config.sqliteFile !== undefined) {
      sqliteFile = config.sqliteFile
    }
    if (config.test !== undefined) {
      test = config.test
    }
  }
  const sequelize = new Sequelize(
    "database",
    "",
    "",
    {
      dialect: "sqlite",
      storage: sqliteFile
    }
  )

  const Payment = sequelize.define(
    "payment",
    {
      address: Sequelize.STRING,
      user_id: Sequelize.STRING,
      endpoint: Sequelize.STRING,
      point: Sequelize.INTEGER,
      price: Sequelize.DOUBLE,
      paid: Sequelize.BOOLEAN
    },
    {
      timestamps: true
    }
  )


  return {
    initDB: function() {
        return sequelize
          .sync({force: test})
    },
    getPayments: function() { 
      return Payment.findAll()
    },
    getPaymentByAddress: function(address) {
      return Payment.findOne({
        where: {
          address: address
        }
      })
    },
    createPayment: function(obj) {
      return Payment.create(obj)
    }
  }
}
