const Sequelize = require('sequelize');
require('dotenv').config();

const { DATABASE_URL, NODE_ENV } = process.env;

let sequelize;

if (NODE_ENV === 'production') {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres'
    // Outras opções para ambientes de desenvolvimento, se necessário
  });
}

module.exports = sequelize;
