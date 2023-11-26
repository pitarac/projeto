require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db/connection');
const authRoutes = require('./auth/routes/authRoutes');
const userRoutes = require('./users/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração da sessão
app.use(session({
    secret: 'sua_chave_secreta',
    resave: false,
    saveUninitialized: true
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Configuração do Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Rotas
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Conexão com o banco de dados
db.authenticate()
    .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso'))
    .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

// Rota para a raiz do domínio
app.get('/', (req, res) => {
    res.render('index'); // Renderiza a view 'index' ao acessar a raiz do domínio
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`O Express está rodando na porta ${PORT}`);
});
