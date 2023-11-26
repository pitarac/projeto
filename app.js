require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const db = require('./db/connection');
const User = require('./models/User');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

require('./models/modelAssociations');

// Configuração da sessão
app.use(session({
    secret: 'sua_chave_secreta',
    resave: false,
    saveUninitialized: true
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

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

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Configuração do Handlebars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Pasta estática
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco de dados
db.authenticate()
    .then(() => console.log('Conectou ao banco com sucesso'))
    .catch(err => console.log('Ocorreu um erro ao conectar', err));

// Rotas
require('./routes/auth')(app);
const trocavagasRoutes = require('./routes/trocavagas');
app.use('/trocavagas', trocavagasRoutes);

// Rota principal
app.get('/', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/trocavagas'); // Redireciona para a página principal do sistema (ou outra página)
    } else if (req.path !== '/auth/login') {
        res.redirect('/auth/login'); // Redireciona para a página de login se o usuário não estiver autenticado e não estiver na página de login
    } else {
        next(); // Permite a continuação para a página de login se já estiver na página de login
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`O Express está rodando na porta ${PORT}`);
});
