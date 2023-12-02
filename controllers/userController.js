const bcrypt = require('bcryptjs');
const express = require('express');
const User = require('../models/User');
const passport = require('passport');
const Trocavaga = require('../models/Trocavaga');
const messagesMiddleware = require('../middleware/messagesMiddleware');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

//Login 
exports.getLoginPage = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('./profile'); // Se o usuário já estiver autenticado, redireciona para a página de perfil
  }

  const failMessage = req.query.fail === 'true' ? 'Credenciais inválidas. Por favor, tente novamente.' : null;
  res.render('login', { failMessage });
};


exports.postLogin = (req, res, next) => {
  const { cpf, password } = req.body;
  console.log('Campos recebidos:', req.body);
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    console.log('Info object:', info); 

    if (!user) {
      const failMessage = 'Credenciais inválidas. Por favor, tente novamente.';
      return res.render('login', { failMessage });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('./profile');
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/index');
};


// Renderiza a página de registro
exports.getRegisterPage = (req, res) => {
  const successMessage = req.session.successMessage || null;
  const errorMessage = req.session.errorMessage || null;

  req.session.successMessage = null;
  req.session.errorMessage = null;

  res.render('register', { successMessage, errorMessage });
};



exports.postRegister = async (req, res) => {
  try {
    const { nome, email, cpf, dataNascimento, password } = req.body;
    const userExists = await User.findOne({ where: { cpf } });

    if (userExists) {
      req.session.errorMessage = 'Usuário já existe.';
      messagesMiddleware(req, res, () => { });
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
    messagesMiddleware(req, res, () => { });
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    req.session.errorMessage = 'Erro ao criar o usuário. Por favor, tente novamente.';
    messagesMiddleware(req, res, () => { });
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

 // Adicionando console.log para verificar os dados recebidos do formulário
 console.log('Dados recebidos do formulário:', req.body);

    if (
      !responsavel ||
      !email ||
      !telefone ||
      !regiao_origem ||
      !escola_origem ||
      !grau_instrucao ||
      !serie_ano ||
      !turno_origem ||
      !regiao_destino ||
      !escola_destino ||
      !turno_destino ||
      !new_trocavaga
    ){
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
    if (req.isAuthenticated()) {
      const user = await User.findByPk(req.user.id, {
        include: Trocavaga, // Isso deve carregar as associações entre User e Trocavaga
      });

      if (user) {
        res.render('profile', { user, isLoggedIn: true, search: req.query.trocavaga });
      } else {
        res.render('profile', { isLoggedIn: true, userDataNotFound: true });
      }
    } else {
      res.render('profile', { isLoggedIn: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar perfil do usuário');
  }
};


// Rota para exibir detalhes de uma trocavaga específica
exports.viewTrocavagaById = async (req, res) => {
  try {
    const trocavaga = await Trocavaga.findByPk(req.params.id); // Considerando o uso do Sequelize

    if (!trocavaga) {
      return res.status(404).send('Trocavaga não encontrada');
    }

    // Renderizar a view com os detalhes da trocavaga
    res.render('trocavagaView', { trocavaga });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar trocavaga');
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
  test: exports.test,
  viewTrocavaga: exports.viewTrocavaga,
  renderAddTrocavaga: exports.renderAddTrocavaga,
  addTrocavaga: exports.addTrocavaga,
  viewProfile: exports.viewProfile,
  viewTrocavagaById: exports.viewTrocavagaById
};