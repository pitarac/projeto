const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../../db/connection');

const User = db.define('User', {
    cpf: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Garante que o campo seja um email válido
        }
    },
    birthDate: {
        type: DataTypes.DATEONLY, // Tipo de dado para armazenar apenas a data
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    hooks: {
        // Hook do Sequelize para criptografar a senha antes de salvar no banco de dados
        beforeCreate: async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
        }
    }
});

module.exports = User;
