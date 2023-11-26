const User = require('../models/User');
const Trocavaga = require('../models/Trocavaga');
const validaCPF = require('../models/valida-cpf');

// Definindo as associações
User.hasMany(Trocavaga, { foreignKey: 'userId' });
Trocavaga.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Trocavaga,
  validaCPF
};
