const { Sequelize } = require('sequelize');
require('dotenv').config();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
});

module.exports = sequelize;
