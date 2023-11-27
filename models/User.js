const Sequelize = require('sequelize');
const db = require('../db/connection');
const Trocavaga = require('./Trocavaga');

const User = db.define('user', {
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  cpf: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  dataNascimento: {
    type: Sequelize.DATEONLY, // Armazena apenas a data, sem a hora
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
  // Outros campos conforme necessário
});



// Sincronize o modelo com o banco de dados
User.sync()
  .then(() => {
    console.log('Modelo User sincronizado com o banco de dados.');
    // Definindo a associação após a sincronização
    User.hasMany(Trocavaga, { foreignKey: 'userId' });
  })
  .catch(error => {
    console.error('Erro ao sincronizar o modelo User:', error);
  });


module.exports = User;
