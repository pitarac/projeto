const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Configuração da estratégia local do Passport
passport.use(new LocalStrategy({ usernameField: 'cpf' }, async (cpf, password, done) => {
    try {
        const user = await User.findOne({ where: { cpf } });

        if (!user) {
            return done(null, false, { message: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Senha inválida.' });
        }
    } catch (error) {
        return done(error);
    }
}));

// Serialização e desserialização do usuário para sessões
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

const authController = {
    // Controlador para autenticar o usuário
    authenticateUser: passport.authenticate('local', {
        successRedirect: '/dashboard', // Rota para redirecionar em caso de sucesso
        failureRedirect: '/login', // Rota para redirecionar em caso de falha na autenticação
        failureFlash: true // Ativa mensagens flash para exibir erros de autenticação
    }),

    // Controlador para logout de usuário
    logoutUser(req, res) {
        req.logout(); // Método para logout do Passport
        res.redirect('/'); // Redireciona para a página inicial após o logout
    }
};

module.exports = authController;
