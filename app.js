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
      // Procurar um usuário com base no nome de usuário fornecido
      const user = await User.findOne({ where: { username } });

      // Se o usuário não for encontrado, retorne uma mensagem de erro
      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }

      // Verificar se a senha fornecida corresponde à senha armazenada no banco de dados
      const passwordIsValid = await bcrypt.compare(password, user.password);

      // Se a senha for inválida, retorne uma mensagem de erro
      if (!passwordIsValid) {
        return done(null, false, { message: 'Senha inválida' });
      }

      // Se a autenticação for bem-sucedida, retorne o usuário autenticado
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

// Rota de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Rota para registro
app.get('/register', (req, res) => {
  res.render('register'); // Certifique-se de ter uma view 'register'
});

// Rota para processar o registro
app.post('/register', async (req, res) => {
  try {
      const { nome, email, cidade, dataNascimento, escolaAtual, escolaDesejada, username, password } = req.body;
      
      // Verificar se o usuário já existe
      const userExists = await User.findOne({ where: { username } });
      if (userExists) {
          return res.render('register', { error: 'Usuário já existe.' });
      }

      // Hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Criar novo usuário
      const newUser = await User.create({
          nome,
          email,
          cidade,
          dataNascimento,
          escolaAtual,
          escolaDesejada,
          username,
          password: hashedPassword
      });

      res.redirect('/login'); // Redireciona para a página de login após o registro
  } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.render('register', { error: 'Erro ao criar o usuário.' });
  }
});

// Rotas de autenticação
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Redirecionamento para login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Outras rotas
const trocavagasRoutes = require('./routes/trocavagas');
app.use('/trocavagas', trocavagasRoutes);

// Iniciando o servidor
app.listen(PORT, function () {
  console.log(`O Express está rodando na porta ${PORT}`);
});
