const Sequelize = require('sequelize');
const db = require('../db/connection');

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
    cidade: {
        type: Sequelize.STRING,
        allowNull: false
    },
    dataNascimento: {
        type: Sequelize.DATEONLY, // Armazena apenas a data, sem a hora
        allowNull: false
    },
    escolaAtual: {
        type: Sequelize.STRING,
        allowNull: false
    },
    escolaDesejada: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
    // Outros campos conforme necessário
});

module.exports = User;
