const bcrypt = require('bcryptjs');
const { cpf } = require('cpf-cnpj-validator');
const express = require('express');
const User = require('../models/User');
const passport = require('passport');
const Trocavaga = require('../models/Trocavaga');
const messagesMiddleware = require('../middleware/messagesMiddleware');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const { render } = require('../app');



//Login 
exports.getLoginPage = (req, res) => {
  console.log('Mensagem de sucesso ao entrar na página de login:', req.session.successMessage);

  if (req.isAuthenticated()) {
    return res.redirect('./profile'); // Se o usuário já estiver autenticado, redireciona para a página de perfil
  }

  // Mensagem de falha vinda dos parâmetros da query
  const failMessage = req.query.fail === 'true' ? 'Credenciais inválidas. Por favor, tente novamente.' : null;

  // Mensagem de sucesso vinda da sessão
  const successMessage = req.session.successMessage;

  // Renderizando a página de login com as mensagens
  res.render('login', { 
    failMessage, 
    successMessage: req.session.successMessage 
  });

  // Limpando a mensagem de sucesso da sessão após ser usada
  delete req.session.successMessage;
};


exports.postLogin = async (req, res, next) => {
  try {
    const { cpf, password } = req.body;
    console.log('Campos recebidos:', req.body);
    passport.authenticate('local', async (err, user, info) => {
      if (err) {
        return next(err);
      }
      console.log('Info object:', info); 

      if (!user) {
        try {
          // Verificar se o usuário existe no banco de dados
          const foundUser = await User.findOne({ where: { cpf } });

          if (!foundUser) {
            // Se o usuário não existe, renderizar a view de login com a mensagem de erro
            return res.render('login', { errorMessage: 'Usuário não encontrado. Por favor, verifique suas credenciais.' });
          }

          // Caso contrário, renderizar a view de login com a mensagem de credenciais inválidas
          return res.render('login', { errorMessage: 'Credenciais inválidas. Por favor, tente novamente.' });
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
          return res.status(500).send('Erro ao buscar usuário');
        }
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('./profile');
      });
    })(req, res, next);
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).send('Erro no login');
  }
};

exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) { 
        // Tratar o erro aqui
        console.error('Erro ao encerrar a sessão:', err);
        return res.redirect('/alguma-pagina-de-erro');
    }
    // Logout foi bem-sucedido
    req.session.destroy((err) => {
        if (err) {
            // Tratar o erro aqui
            console.error('Erro ao destruir a sessão:', err);
            return res.redirect('/alguma-pagina-de-erro');
        }
        // Limpar o cookie de sessão, se estiver usando
        res.clearCookie('connect.sid'); // Substitua 'connect.sid' pelo nome do seu cookie de sessão, se for diferente
        // Redirecionar para a página de login ou home
        res.redirect('/');
    });
});
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
    const { nome, email, cpf: cpfInput, dataNascimento, password } = req.body;

    // Verifica se o CPF inserido é válido
    if (!cpf.isValid(cpfInput)) {
      req.session.errorMessage = 'CPF inválido. Por favor, insira um CPF válido.';
      messagesMiddleware(req, res, () => {});
      return res.redirect('/auth/register');
    }

    const userExists = await User.findOne({ where: { cpf: cpfInput } });

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
      cpf: cpfInput,
      dataNascimento,
      password: hashedPassword,
    });

    req.session.successMessage = 'Usuário criado com sucesso! Faça login para continuar.';

    messagesMiddleware(req, res, () => {});
    console.log('Mensagem de sucesso:', req.session.successMessage);
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    req.session.errorMessage = 'Erro ao criar o usuário. Por favor, tente novamente.';
    messagesMiddleware(req, res, () => {});
    res.redirect('/auth/register');
  }
};

exports.forgotPasswordPage= (req, res) => {
  res.render('forgot-password')
};

// Controlador para lidar com a submissão do formulário de recuperação de senha
exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Verifique se o email do usuário existe no banco de dados
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // O usuário com o email fornecido não foi encontrado
      return res.render('login', { error: 'Email não encontrado.' });
    }
    res.redirect('/');
    // Gere um token de recuperação de senha (pode ser um código aleatório)
    const recoveryToken = Math.random().toString(36).slice(2);

    // Salve o token no banco de dados associado ao usuário
    await Token.create({
      token: recoveryToken,
      userId: user.id,
    });

    // Configure o serviço de email (exemplo usando Gmail)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'seu_email@gmail.com', // Seu endereço de email
        pass: 'sua_senha', // Sua senha de email
      },
    });

    // Configure as opções do email
    const mailOptions = {
      from: 'seu_email@gmail.com',
      to: email,
      subject: 'Recuperação de Senha',
      text: `Use o seguinte código para redefinir sua senha: ${recoveryToken}`,
    };

    // Envie o email com o token
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.redirect('/');
        console.error('Erro ao enviar email de recuperação de senha:', error);
        res.status(500).send('Erro ao enviar o email de recuperação de senha.');
      } else {
        console.log('Email de recuperação de senha enviado:', info.response);
        // Redirecione para a página inicial após o envio bem-sucedido
        res.redirect('/');
      }
    });
  } catch (error) {
    res.redirect('/');
    console.error(error);
    res.status(500).send('Erro ao processar a solicitação.');
  }
};




exports.resetPasswordPage = async (req, res) => {
  try {
    const token = req.params.token; // Obtenha o token dos parâmetros da URL
    const newPassword = req.body.password; // Obtenha a nova senha do corpo do formulário
    const confirmPassword = req.body.confirmPassword; // Obtenha a confirmação da nova senha do corpo do formulário

    // Consulte o banco de dados para verificar se o token é válido
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      // Se o token não for válido ou expirou, redirecione para uma página de erro ou exiba uma mensagem de erro
      return res.render('reset-password-error', { error: 'O token de redefinição de senha é inválido ou expirou.' });
    }

    if (newPassword !== confirmPassword) {
      // Se as senhas não coincidirem, redirecione para uma página de erro ou exiba uma mensagem de erro
      return res.render('reset-password-error', { error: 'As senhas não coincidem.' });
    }

    // Atualize a senha do usuário no banco de dados
    user.password = newPassword;
    user.resetPasswordToken = null; // Limpe o token de redefinição de senha
    user.resetPasswordExpires = null; // Limpe a data de expiração do token
    await user.save();

    // Redirecione para uma página de sucesso ou exiba uma mensagem de sucesso
    res.render('reset-password-success', { success: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
    // Trate erros adequadamente aqui
    res.status(500).send('Erro ao redefinir a senha');
  }
};

exports.postResetPassword = async (req, res) => {
  try {
    const token = req.params.token; // Obtenha o token dos parâmetros da URL
    const newPassword = req.body.password; // Obtenha a nova senha do corpo do formulário
    const confirmPassword = req.body.confirmPassword; // Obtenha a confirmação da nova senha do corpo do formulário

    // Consulte o banco de dados para verificar se o token é válido
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      // Se o token não for válido ou expirou, redirecione para uma página de erro ou exiba uma mensagem de erro
      return res.render('reset-password-error', { error: 'O token de redefinição de senha é inválido ou expirou.' });
    }

    if (newPassword !== confirmPassword) {
      // Se as senhas não coincidirem, redirecione para uma página de erro ou exiba uma mensagem de erro
      return res.render('reset-password-error', { error: 'As senhas não coincidem.' });
    }

    // Atualize a senha do usuário no banco de dados
    user.password = newPassword;
    user.resetPasswordToken = null; // Limpe o token de redefinição de senha
    user.resetPasswordExpires = null; // Limpe a data de expiração do token
    await user.save();

    // Redirecione para uma página de sucesso ou exiba uma mensagem de sucesso
    res.render('reset-password-success', { success: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
    // Trate erros adequadamente aqui
    res.status(500).send('Erro ao redefinir a senha');
  }
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
    res.redirect('./login'); // Redirecionar para a página de login se o usuário não estiver autenticado
  }
};

exports.addTrocavaga = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('./login'); // Redirecionar para a página de login se o usuário não estiver autenticado
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

    req.session.successMessage = 'Vaga adicionada com sucesso!';
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Erro ao adicionar a vaga:', error);
    res.render('add', {
      isLoggedIn: req.isAuthenticated(),
      error: 'Erro ao adicionar a vaga. Por favor, preencha todos os campos corretamente.'
    });
  }
};

exports.deleteTrocavaga = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('./login'); // Redirecionar para a página de login se o usuário não estiver autenticado
    }

    const { id } = req.params; // Aqui você pega o ID da trocavaga a ser deletada da URL

    // Verificar se a trocavaga existe
    const trocavaga = await Trocavaga.findByPk(id);
    if (!trocavaga) {
      return res.status(404).send('Trocavaga não encontrada.');
    }

    // Verificar se o usuário logado tem permissão para deletar a trocavaga
    if (trocavaga.UserId !== req.user.id) {
      return res.status(403).send('Você não tem permissão para deletar essa trocavaga.');
    }

    await Trocavaga.destroy({ where: { id } }); // Deletar a trocavaga

    res.redirect('/auth/profile')
  } catch (error) {
    console.error('Erro ao deletar a trocavaga:', error);
    res.status(500).send('Erro ao deletar a trocavaga.');
  }
};

exports.viewProfile = async (req, res) => {
  try {
    let userWithTrocavagas;

    if (req.isAuthenticated()) {
      const userId = req.user.id; // Obtém o ID do usuário autenticado

      userWithTrocavagas = await User.findByPk(userId, {
        include: Trocavaga, // Isso carrega as associações entre User e Trocavaga
      });

      console.log('Dados do usuário obtidos:', userWithTrocavagas); // Verifica os dados do usuário com Trocavagas
    }

    // Consulta todas as vagas disponíveis
    const allVacancies = await Trocavaga.findAll();

    if (!userWithTrocavagas) {
      return res.render('profile', { isLoggedIn: false });
    }

    if (!userWithTrocavagas) {
      return res.render('profile', { isLoggedIn: true, userDataNotFound: true });
    }

    res.render('profile', { user: userWithTrocavagas, isLoggedIn: true, vacancies: allVacancies, search: req.query.trocavaga });
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
    res.render('view', { trocavaga });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar trocavaga');
  }
};


// Redenriza a pagina Index com exibição de vagas 

exports.renderIndexPage = async (req, res) => {
  const isLoggedIn = req.isAuthenticated();
  
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

    // Corrigido: Passando isLoggedIn junto com trocavagas e search
    res.render('index', { trocavagas, search, isLoggedIn });

  } catch (err) {
    console.error('Erro ao renderizar a página de índice:', err);
    res.status(500).send('Erro ao buscar trocavagas');
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
  viewTrocavagaById: exports.viewTrocavagaById,
  renderIndexPage: exports.renderIndexPage,
  deleteTrocavaga: exports.deleteTrocavaga
};