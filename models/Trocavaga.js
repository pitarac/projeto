const Sequelize = require('sequelize');
const db = require('../db/connection');
const User = require('./User');

const Trocavaga = db.define('trocavaga', {
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  telefone: {
    type: Sequelize.INTEGER,
  },
  regiao_origem: {
    type: Sequelize.STRING,
  },
  escola_origem: {
    type: Sequelize.STRING,
  },
  grau_instrucao: {
    type: Sequelize.STRING,
  },
  serie_ano: {
    type: Sequelize.STRING,
  },
  turno_origem: {
    type: Sequelize.STRING,
  },
  regiao_destino: {
    type: Sequelize.STRING,
  },
  escola_destino: {
    type: Sequelize.STRING,
  },
  turno_destino: {
    type: Sequelize.STRING,
  },
  new_trocavaga: {
    type: Sequelize.INTEGER,
  }
});

// Definindo a associação

// Sincronize o modelo com o banco de dados
Trocavaga.sync()
  .then(() => {
    console.log('Modelo Trocavaga sincronizado com o banco de dados.');
    Trocavaga.belongsTo(User, { foreignKey: 'userId' });

  })
  .catch(error => {
    console.error('Erro ao sincronizar o modelo Trocavaga:', error);
  });

module.exports = Trocavaga;
