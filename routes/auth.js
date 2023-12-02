const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
//const searchVaga = require ('../controllers/searchVaga')

// Rota para o login
router.get('/login', userController.getLoginPage);
router.post('/login', userController.postLogin);

// Rota para logout
router.get('/logout', userController.logout);

// Rota para o registro de usuário
router.get('/register', userController.getRegisterPage);
router.post('/register', userController.postRegister);

// Rota para recuperar senha
router.get('/forgot-password', userController.forgotPasswordPage);
router.post('/forgot-password', userController.postForgotPassword);

// Rota para redefinir a senha
router.get('/reset-password/:token', userController.resetPasswordPage);
router.post('/reset-password/:token', userController.postResetPassword);

// Rota para visualizar (não requer autenticação)
router.get('/view/:id', userController.viewTrocavagaById);

// Rota para visualizar o perfil do usuário
router.get('/profile', ensureAuthenticated, userController.viewProfile);


// Rota para renderizar a página de adição de troca de vaga (GET)
router.get('/add', ensureAuthenticated, userController.renderAddTrocavaga);

// Rota para lidar com a submissão do formulário de adição de troca de vaga (POST)
router.post('/add', ensureAuthenticated, userController.addTrocavaga);

module.exports = router;
