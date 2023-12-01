require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db/connection');
const User = require('./models/User');
const Trocavaga = require('./models/Trocavaga');
const session = require('express-session');

const authRoutes = require('./routes/auth');

//const router = express.Router();
//const fetchUserCPF = require('./middleware/fetchUserCPF');

const app = express();
const PORT = process.env.PORT || 3000;



// Configuração da sessão
app.use(session({
    secret: 'sua_chave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 70 * 60 * 1000 },
   // store: 
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Use as rotas de autenticação
app.use('/auth', authRoutes);



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

// Conexão com o banco de dados e sincronização dos modelos
(async () => {
    try {
        await db.authenticate();
        console.log('Conectou ao banco com sucesso');

        await User.sync();
        await Trocavaga.sync();

        // Configuração das associações
        User.hasMany(Trocavaga);
        Trocavaga.belongsTo(User);

        console.log('Modelos sincronizados com o banco de dados.');

        // Inicia o servidor após a sincronização
        const server = app.listen(PORT, () => {
            console.log(`O Express está rodando na porta ${PORT}`);
        });

        // Manipulador de eventos para lidar com erros no servidor
        server.on('error', (err) => {
            console.error('Erro no servidor:', err);
            // Faça algo com o erro, se necessário
        });
    } catch (error) {
        console.error('Erro ao conectar e sincronizar modelos:', error);
    }
})();



app.get('/', async (req, res) => {
    try {
      let search = req.query.trocavaga;
      let query = '%' + search + '%';
  
      let trocavagas;
  
      if (!search) {
        trocavagas = await Trocavaga.findAll({
          order: [['createdAt', 'DESC']]
        });
      } else {
        trocavagas = await Trocavaga.findAll({
          where: {
            [Op.or]: [
              { escola_origem: { [Op.like]: query } },
              { escola_destino: { [Op.like]: query } },
              { regiao_origem: { [Op.like]: query } },
              { regiao_destino: { [Op.like]: query } }
            ]
          },
          order: [['createdAt', 'DESC']]
        });
      }
  
      res.render('index', { trocavagas, search });
    } catch (err) {
      console.log(err);
      res.status(500).send('Erro ao buscar trocavagas');
    }
  });




module.exports = app;