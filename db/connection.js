const Sequelize = require('sequelize');
require('dotenv').config(); // Adicione esta linha se estiver usando variáveis de ambiente

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_STORAGE || './db/app.db', // Use variável de ambiente ou caminho padrão
  // Adicione outras opções de configuração aqui, se necessário
});

module.exports = sequelize;
