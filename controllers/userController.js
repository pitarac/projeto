const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport');
const Trocavaga = require('../models/Trocavaga');
const messagesMiddleware = require('../middleware/messagesMiddleware');
const ensureNotAuthenticated = require('../middleware/ensureNotAuthenticated');

// Controlador para lidar com a autenticação
exports.getLoginPage = ensureNotAuthenticated;
exports.getRegisterPage = ensureNotAuthenticated;

exports.postLogin = passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/auth/login?fail=true',
  failureFlash: false
});

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/index');
};

exports.postRegister = async (req, res) => {
  try {
    const { nome, email, cpf, dataNascimento, password } = req.body;
    const userExists = await User.findOne({ where: { cpf } });

    if (userExists) {
      req.session.errorMessage = 'Usuário já existe.';
      messagesMiddleware(req, res, () => {});
      return res.redirect('/auth/register');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      nome,
      email,
      cpf,
      dataNascimento,
      password: hashedPassword
    });

    req.session.successMessage = 'Usuário criado com sucesso! Faça login para continuar.';
    messagesMiddleware(req, res, () => {});
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    req.session.errorMessage = 'Erro ao criar o usuário. Por favor, tente novamente.';
    messagesMiddleware(req, res, () => {});
    res.redirect('/auth/register');
  }
};

exports.forgotPasswordPage = (req, res) => {
  res.render('forgot-password');
};

exports.postForgotPassword = (req, res) => {
  res.send('Instruções para redefinir a senha foram enviadas por e-mail.');
};

exports.resetPasswordPage = (req, res) => {
  res.render('reset-password', { token: req.params.token });
};

exports.postResetPassword = (req, res) => {
  res.send('Senha redefinida com sucesso.');
};

exports.test = (req, res) => {
  res.send('Teste realizado com sucesso');
};

exports.viewTrocavaga = async (req, res) => {
  try {
    const trocavaga = await Trocavaga.findOne({
      where: { id: req.params.id }
    });
    res.render('view', { Trocavaga: trocavaga });
  } catch (error) {
    console.error('Erro ao encontrar a vaga:', error);
    res.status(500).send('Erro ao encontrar a vaga');
  }
};

exports.renderAddTrocavaga = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('add', {
      isLoggedIn: true,
      nome: req.user.nome,
      email: req.user.email,
      // Outras propriedades necessárias para a renderização
    });
  } else {
    res.redirect('/login'); // Redirecionar para a página de login se o usuário não estiver autenticado
  }
};

exports.addTrocavaga = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('/login'); // Redirecionar para a página de login se o usuário não estiver autenticado
    }

    const {
      responsavel,
      email,
      telefone,
      regiao_origem,
      escola_origem,
      grau_instrucao,
      serie_ano,
      turno_origem,
      regiao_destino,
      escola_destino,
      turno_destino,
      new_trocavaga
    } = req.body;

    if (!responsavel || !email || !telefone || !regiao_origem /*... outras verificações ...*/) {
      throw new Error('Por favor, preencha todos os campos obrigatórios.');
    }

    const userId = req.user.id;
    const createdTrocavaga = await Trocavaga.create({
      responsavel,
      email,
      telefone,
      regiao_origem,
      escola_origem,
      grau_instrucao,
      serie_ano,
      turno_origem,
      regiao_destino,
      escola_destino,
      turno_destino,
      new_trocavaga,
      UserId: userId
    });

    res.render('add', {
      isLoggedIn: req.isAuthenticated(),
      success: 'Vaga adicionada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao adicionar a vaga:', error);
    res.render('add', {
      isLoggedIn: req.isAuthenticated(),
      error: 'Erro ao adicionar a vaga. Por favor, preencha todos os campos corretamente.'
    });
  }
};


exports.viewProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userWithVagas = await User.findOne({
      where: { id: userId },
      include: {
        model: Trocavaga
      }
    });

    res.render('perfil', { isLoggedIn: true, user: userWithVagas });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário e suas vagas:', error);
    res.status(500).send('Erro ao buscar dados do usuário');
  }
};


module.exports = {
  getLoginPage: exports.getLoginPage,
  postLogin: exports.postLogin,
  logout: exports.logout,
  getRegisterPage: exports.getRegisterPage,
  postRegister: exports.postRegister,
  forgotPasswordPage: exports.forgotPasswordPage,
  postForgotPassword: exports.postForgotPassword,
  resetPasswordPage: exports.resetPasswordPage,
  postResetPassword: exports.postResetPassword,
  viewTrocavaga: exports.viewTrocavaga,
  renderAddTrocavaga: exports.renderAddTrocavaga,
  addTrocavaga: exports.addTrocavaga,
  viewProfile: exports.viewProfile
};
