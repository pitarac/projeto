const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ensureNotAuthenticated = require('../middleware/ensureNotAuthenticated');
const router = express.Router();

module.exports = function (app) {
    router.get('/login', ensureNotAuthenticated, (req, res) => {
        res.render('login', { isLoggedIn: req.isAuthenticated() });
    });

    router.post('/login', passport.authenticate('local', {
        successRedirect: '/trocavagas/profile',
        failureRedirect: '/auth/login',
        failureFlash: false
    }));

    router.get('/logout', (req, res) => {
        req.logout();
        isLoggedIn = false;
        res.redirect('/index');
    });

    router.get('/register', ensureNotAuthenticated, (req, res) => {
        res.render('register', {
            successMessage: req.session.successMessage || '',
            errorMessage: req.session.errorMessage || ''
        });
    });


    router.post('/register', async (req, res) => {
        try {
            const { nome, email, cpf, dataNascimento, password } = req.body;
            const userExists = await User.findOne({ where: { cpf } });

            if (userExists) {
                req.session.errorMessage = 'Usuário já existe.';
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
            res.redirect('/auth/login');
        } catch (error) {
            console.error('Erro ao criar usuário:', error);

            req.session.errorMessage = 'Erro ao criar o usuário. Por favor, tente novamente.';
            res.redirect('/auth/register');
        }
    });

    router.get('/forgot-password', (req, res) => {
        res.render('forgot-password');
    });

    router.post('/forgot-password', (req, res) => {
        res.send('Instruções para redefinir a senha foram enviadas por e-mail.');
    });

    router.get('/reset-password/:token', (req, res) => {
        res.render('reset-password', { token: req.params.token });
    });

    router.post('/reset-password/:token', (req, res) => {
        res.send('Senha redefinida com sucesso.');
    });

    app.use('/auth', router);
};
