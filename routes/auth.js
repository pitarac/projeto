const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

module.exports = function (app) {
    router.get('/login', (req, res) => {
        res.render('login');
    });

    router.post('/login', passport.authenticate('local', {
        successRedirect: '/trocavagas/profile',    
        failureRedirect: '/auth/login',
        failureFlash: false
    }));

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/auth/login');
    });

    router.get('/register', (req, res) => {
        res.render('register');
    });

    router.post('/register', async (req, res) => {
        try {
            // ... (código para registro de usuário)
        } catch (error) {
            // ... (tratamento de erro no registro de usuário)
        }
    });

    router.get('/forgot-password', (req, res) => {
        res.render('forgot-password');
    });

    router.post('/forgot-password', (req, res) => {
        // ... (lógica para redefinição de senha)
    });

    router.get('/reset-password/:token', (req, res) => {
        res.render('reset-password', { token: req.params.token });
    });

    router.post('/reset-password/:token', (req, res) => {
        // ... (lógica para redefinição de senha com base no token)
    });

    app.use('/auth', router);
};
