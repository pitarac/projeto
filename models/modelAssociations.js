// modelAssociations.js

const User = require('./User')
const Trocavaga = require('./Trocavaga')

// Definindo as associações
User.hasMany(Trocavaga, { foreignKey: 'userId' })
Trocavaga.belongsTo(User, { foreignKey: 'userId' })

module.exports = {
  User,
  Trocavaga
}
