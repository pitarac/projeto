//Trocavaga.js

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/connection');
const User = require('../models/User');
class Trocavaga extends Model {}

Trocavaga.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    telefone: {
      type: DataTypes.INTEGER,
    },
    regiao_origem: {
      type: DataTypes.STRING,
    },
    escola_origem: {
      type: DataTypes.STRING,
    },
    grau_instrucao: {
      type: DataTypes.STRING,
    },
    serie_ano: {
      type: DataTypes.STRING,
    },
    turno_origem: {
      type: DataTypes.STRING,
    },
    regiao_destino: {
      type: DataTypes.STRING,
    },
    escola_destino: {
      type: DataTypes.STRING,
    },
    turno_destino: {
      type: DataTypes.STRING,
    },
    new_trocavaga: {
      type: DataTypes.INTEGER,
    }
  },
  {
    sequelize,
    modelName: 'Trocavaga'
  }
);

module.exports = Trocavaga;
