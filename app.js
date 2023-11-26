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
const User = require('./models/User'); // Modelo de usuário
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para verificar se o usuário está autenticado
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Avança para a próxima etapa
    }
    res.redirect('/login'); // Redireciona para a página de login se não estiver autenticado
}

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

// Rota principal (Redirecionamento para login se não estiver autenticado)
app.get('/', ensureAuthenticated, (req, res) => {
    // Renderizar a página principal aqui após a autenticação
    res.render('home');
});

// Rota de login
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login', // Redireciona para o login se falhar
    failureFlash: false
}), (req, res) => {
    res.redirect('/'); // Redireciona para a página inicial se o login for bem-sucedido
});

// Rota de logout
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// Rota de registro
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { nome, email, cpf, dataNascimento, password } = req.body;

        const userExists = await User.findOne({ where: { cpf } });
        if (userExists) {
            return res.render('register', { error: 'Usuário já existe.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            nome,
            email,
            cpf,
            dataNascimento,
            password: hashedPassword
        });

        res.redirect('/login');
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.render('register', { error: 'Erro ao criar o usuário. Por favor, tente novamente.' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`O Express está rodando na porta ${PORT}`);
});


