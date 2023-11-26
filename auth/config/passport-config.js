// auth/passport-config.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Definição da estratégia local
passport.use(new LocalStrategy(
  async (cpf, password, done) => {
    try {
      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return done(null, false, { message: 'CPF não encontrado.' });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message: 'Senha incorreta.' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialização e desserialização do usuário para sessões
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport; // Exporta as configurações do Passport
