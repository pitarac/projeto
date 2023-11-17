const express = require('express');
const exphbs = require('express-handlebars');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const db = require('./db/connection');
const Trocavaga = require('./models/Trocavaga');
const User = require('./models/User');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração da sessão
app.use(
  session({
    secret: 'sua_chave_secreta', // use uma chave secreta real aqui
    resave: false,
    saveUninitialized: true
  })
);

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuração da estratégia local do Passport
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      let user = await User.findOne({ where: { username } });
      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }

      let passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        return done(null, false, { message: 'Senha inválida' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Serialização e desserialização do usuário para sessões
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    let user = await User.findByPk(id);
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

// Rotas de autenticação
app.get('/login', (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false // Você pode habilitar mensagens de erro, se desejar
  })
);

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Outras rotas
const trocavagasRoutes = require('./routes/trocavagas');
const authRoutes = require('./routes/auth');

app.use('/trocavagas', trocavagasRoutes);
app.use('/auth', authRoutes);

// Iniciando o servidor
app.listen(PORT, function () {
  console.log(`O Express está rodando na porta ${PORT}`);
});
