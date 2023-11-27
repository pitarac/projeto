const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

module.exports = function (app) {
    router.get('/login', (req, res) => {
        res.render('login');
        isLoggedIn = true;

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

    router.get('/register', (req, res) => {
        res.render('register');
    });

    router.post('/register', async (req, res) => {
        try {
            const { nome, email, cpf, dataNascimento, password } = req.body;
            const userExists = await User.findOne({ where: { cpf } });
            
            if (userExists) {
                return res.render('register', { error: 'Usuário já existe.' });
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

            res.redirect('/auth/login');
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.render('register', { error: 'Erro ao criar o usuário. Por favor, tente novamente.' });
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
